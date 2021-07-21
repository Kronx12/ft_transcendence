import { WebSocketServer, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Socket } from "dgram";
import { Server } from "http";
import { Cron } from '@nestjs/schedule';

import { Client, Room, RoomBonus, Queue, send, ClientTimeout, State } from "../class/Utils";
import { GameType, Invitation, InvitationState } from "../class/Invitation";

@WebSocketGateway(4001, { transports: ['websocket'] })
export class QueueService implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    queue = new Queue();
    queue_bonus = new Queue();
    rooms: Room[] = [];
    rooms_bonus: RoomBonus[] = [];
    clients: Client[] = [];

    invitations: Invitation[] = [];

    timeoutList: ClientTimeout[] = [];

    handleConnection(client: Socket) {
        const self = this;
        console.log("CONNECTION");

        // Add le client si le client existe pas
        if (this.getClientBySocket(client) == null)
            this.clients.push(new Client(null, client, State.NEED_USER));

        // Demande le user si le client n'as pas de user
        if (this.getClientBySocket(client).getUser() == null) {
            console.log("EMIT_USER");
            send(client, "emit_user");
        }

        client.on("message", function(event : string) {
            const data = JSON.parse(event);
            
            // Recois le user
            if (data.type === 'ack_user') {
                // Si utilisateur deja dans la liste, mettre a jour le client sinon fillUser
                if (self.getClientByUser(data.content.user) === null)
                    self.fillUser(client, data.content.user);
                else
                    self.updateClient(data.content.user, client);

                // Si il etait en timeout on le retire
                if (self.isInTimeoutList(data.content.user)) {
                    self.removeFromTimeout(data.content.user);
                    self.getClientByUser(data.content.user).setState(State.READY);
                }
            // Rejoins la file d'attente
            } else if (data.type === 'emit_join_standard') {
                self.queue.push(self.getClientByUser(data.content.user));
                send(client, "ack_join_standard");
            }  else if (data.type === 'emit_join_bonus') {
                self.queue_bonus.push(self.getClientByUser(data.content.user));
                send(client, "ack_join_bonus");
            // Quitte la file d'attente
            } else if (data.type === 'emit_leave_standard') {
                self.queue.removeByUser(data.content.user);
                send(client, "ack_leave_standard");
            // Update coord
            }  else if (data.type === 'emit_leave_bonus') {
                self.queue.removeByUser(data.content.user);
                send(client, "ack_leave_bonus");
            // Update coord
            } else if (data.type === 'emit_key') {
                for (let i = 0; i < self.rooms.length; i++)
                    if (self.rooms[i]._id === data.content.room_id)
                        self.rooms[i].update(data.content.user, data.content.key);
                for (let i = 0; i < self.rooms_bonus.length; i++)
                    if (self.rooms_bonus[i]._id === data.content.room_id)
                        self.rooms_bonus[i].update(data.content.user, data.content.key, data.content.space);
            } else if (data.type === 'emit_checkid') {
                let find = false;
                console.log("EMIT CHECKID");
                self.rooms.forEach(room => {
                    if (data.content.room_id === room._id) {
                        find = true;
                        room.addSpectator(client);
                    }
                });
                self.rooms_bonus.forEach(room => {
                    if (data.content.room_id === room._id) {
                        find = true;
                        room.addSpectator(client)
                    }
                });
                if (!find)
                    send(client, "ack_redirect", {});
            } else if (data.type == 'emit_send_invite_classic') {
                console.log("Invitation send");
                self.invitations.push(new Invitation(data.content.transmitter, self.getClientById(data.content.transmitter), data.content.receiver, self.getClientById(data.content.receiver), GameType.NORMAL));
            } else if (data.type == 'emit_send_invite_bonus') {
                console.log("Invitation bonus send");
                self.invitations.push(new Invitation(data.content.transmitter, self.getClientById(data.content.transmitter), data.content.receiver, self.getClientById(data.content.receiver), GameType.BONUS));
            } else if (data.type == 'accept_invite') {
                console.log("Invitation accepted");
                self.invitations.forEach(e => {
                    if (e._game_type == data.content.type && e._transmitter == data.content.transmitter && e._receiver == data.content.receiver)
                        var tmp_uuid: string = "";
                        if (e._game_type == GameType.NORMAL) {
                            let new_room = new Room(e._transmitter_socket, e._receiver_socket);
                            tmp_uuid = new_room._id;
                            new_room.setup();
                            new_room.update_game();
                            self.rooms.push(new_room);
                            self.queue.pop();
                            self.queue.pop();
                        } else {
                            let new_room = new RoomBonus(e._transmitter_socket, e._receiver_socket);
                            tmp_uuid = new_room._id;
                            new_room.setup();
                            new_room.update_game();
                            self.rooms_bonus.push(new_room);
                            self.queue_bonus.pop();
                            self.queue_bonus.pop();
                        }
                        e.accept(tmp_uuid);
                });
            } else if (data.type == 'decline_invite') {
                console.log("Invitation declined");
                self.invitations.forEach(e => {
                    if (e._game_type == data.content.type && e._transmitter == data.content.transmitter && e._receiver == data.content.receiver)
                        e.decline();
                });
            }
        });
        console.log("Connecté : " + this.queue._store.length);
    }

    handleDisconnect(client: Socket) {
        console.log("DISCONNECTION");
        if (this.getClientBySocket(client) == null)
            return;
          this.getClientBySocket(client).setState(State.WAITING);
        this.timeoutList.push(new ClientTimeout(this.getClientBySocket(client)));
        this.rooms.forEach(room => {
            if (room._playera._socket == client) room.stopPA();
            else if (room._playerb._socket == client) room.stopPB();
            room.removeSpectator(client);
        });
        this.rooms_bonus.forEach(room => {
            if (room._playera._socket == client) room.stopPA();
            else if (room._playerb._socket == client) room.stopPB();
            room.removeSpectator(client);
        });
        console.log("Déconnecté : " + this.queue._store.length);
    }

    @Cron("* * * * * *")
    handleCron() {
        // Remove paste room
        this.rooms = this.rooms.filter(obj => (!(obj._end && obj._start_chrono <= 0)));
        this.rooms_bonus = this.rooms_bonus.filter(obj => (!(obj._end && obj._start_chrono <= 0)));

        // Update des timeouts
        for (let i = 0; i < this.timeoutList.length; i++)
            this.timeoutList[i]._timeout--;            

        // Remove des clients
        let remove = true;
        while (remove) {
            remove = false;
            for (let i = 0; i < this.timeoutList.length; i++) {
                if (this.timeoutList[i]._timeout <= 0) {
                    this.removeFromClientsByUser(this.timeoutList[i]._client._user);
                    this.removeFromClientsBySocket(this.timeoutList[i]._client._socket);
                    this.queue.removeBySocket(this.timeoutList[i]._client._socket);
                    this.queue.removeByUser(this.timeoutList[i]._client._user);
                    this.removeFromTimeout(this.timeoutList[i]._client._user);
                    remove = true;
                }
            }
        }    

        // Broadcast du compte de la queue
        for (let i = 0; i < this.queue._store.length; i++)
            send(this.queue._store[i]._socket, "emit_count", {count: this.queue._store.length});
            
        for (let i = 0; i < this.queue_bonus._store.length; i++)
            send(this.queue_bonus._store[i]._socket, "emit_count", {count: this.queue_bonus._store.length});

        if (this.queue._store.length >= 2) {
            let new_room = new Room(this.queue._store[0], this.queue._store[1]);
            new_room.setup();
            new_room.update_game();
            this.rooms.push(new_room);
            this.queue.pop();
            this.queue.pop();
            console.log("Create room")
            console.log("len:", this.rooms.length)
        }
        
        if (this.queue_bonus._store.length >= 2) {
            let new_room = new RoomBonus(this.queue_bonus._store[0], this.queue_bonus._store[1]);
            new_room.setup();
            new_room.update_game();
            this.rooms_bonus.push(new_room);
            this.queue_bonus.pop();
            this.queue_bonus.pop();
        }

        this.invitations = this.invitations.filter(obj => (obj._state !== InvitationState.DECLINED));
        this.invitations.forEach(e => {
            if (e._state == InvitationState.ACCEPTED) {
                let new_room = new Room(e._transmitter_socket, e._receiver_socket);
                new_room.setup();
                new_room.update_game();
                if (e._game_type == GameType.NORMAL)
                    this.rooms.push(new_room);
                else if (e._game_type == GameType.BONUS)
                    this.rooms.push(new_room);
            } else if (e._timeout <= 0) {
                e.decline();
            }
        });
    }

    getClientBySocket(s: Socket): Client {
        for (let i = 0; i < this.clients.length; i++)
            if (this.clients[i].compareBySocket(s))
                return this.clients[i];
        return null;
    }

    getClientByUser(us: any): Client {
        for (let i = 0; i < this.clients.length; i++)
            if (this.clients[i].compareByUser(us))
                return this.clients[i];
        return null;
    }

    getClientById(id: number): Client {
        for (let i = 0; i < this.clients.length; i++)
            if (this.clients[i]._user != null && this.clients[i]._user.id == id)
                return this.clients[i];
        return null;
    }

    fillUser(client: Socket, us: any): void {
        if (us == null)
            return;
        this.getClientBySocket(client).setUser(us);
        this.getClientBySocket(client).setState(State.READY);
    }

    updateClient(us: any, client: Socket): void {
        if (this.getClientByUser(us) == null)
            return;
        this.getClientByUser(us).setSocket(client);
        this.getClientByUser(us).setState(State.READY);
    }

    isInTimeoutList(user: any): boolean {
        for (let i = 0; i < this.timeoutList.length; i++)
            if (this.timeoutList[i]._client != null &&
                this.timeoutList[i]._client._user != null &&
                user.id === this.timeoutList[i]._client._user.id)
                return true;
        return false;
    }

    removeFromTimeout(user: any) {
        this.timeoutList = this.timeoutList.filter(obj => (obj._client._user && obj._client._user.id !== user.id));
    }

    removeFromClientsBySocket(client: Socket) {
        this.clients = this.clients.filter(obj => obj._socket !== client);
    }

    removeFromClientsByUser(user: any) {
        this.clients = this.clients.filter(obj => (obj._user && obj._user.id !== user.id));
    }
}
