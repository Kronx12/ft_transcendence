import { WebSocketServer, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Socket } from "dgram";
import { Server } from "http";
import { Cron, CronExpression } from '@nestjs/schedule';

import { Client, Room, Queue, send, ClientTimeout, State } from "../class/Utils";

@WebSocketGateway(4001, { transports: ['websocket'] })
export class QueueService implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    queue = new Queue();
    rooms: Room[] = [];
    clients: Client[] = [];

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
                console.log("ACK_USER");
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
            } else if (data.type === 'emit_join') {
                console.log("EMIT_JOIN");
                self.queue.push(self.getClientByUser(data.content.user));
                send(client, "ack_join");
            // Quitte la file d'attente
            } else if (data.type === 'emit_leave') {
                console.log("EMIT_LEAVE");
                self.queue.removeByUser(data.content.user);
                send(client, "ack_leave");
            // Update coord
            } else if (data.type === 'emit_key') {
                console.log("EMIT_KEY");
                for (let i = 0; i < self.rooms.length; i++)
                    if (self.rooms[i]._id === data.content.room_id)
                        self.rooms[i].update(data.content.user, data.content.x, data.content.y);
            }
        });
        console.log("Connecté : " + this.queue._store.length);
    }

    handleDisconnect(client: Socket) {
        console.log("DISCONNECTION");
        this.getClientBySocket(client).setState(State.WAITING);
        this.timeoutList.push(new ClientTimeout(this.getClientBySocket(client)));
        console.log("Déconnecté : " + this.queue._store.length);
    }

    @Cron(CronExpression.EVERY_5_SECONDS)
    handleCron() {
        // Update des timeouts
        for (let i = 0; i < this.timeoutList.length; i++)
            this.timeoutList[i]._timeout--;            

        // Remove des clients
        let remove: boolean = true;        
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

        if (this.queue._store.length >= 2) {
            let new_room = new Room(this.queue._store[0], this.queue._store[1]);
            new_room.setup();
            this.rooms.push(new_room);
            this.queue.pop();
            this.queue.pop();
        }

        // console.log("Count clients : " + this.clients.length);
        // console.log("clients : ");
        // console.log(this.clients);
        // console.log("Count queue : " + this.queue._store.length);
        // console.log("queue : ");
        // console.log(this.queue._store);
        // console.log("Count timeoutlist : " + this.timeoutList.length);
        // console.log("timeoutlist : ");
        // console.log(this.timeoutList);
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

    fillUser(client: Socket, us: any): void {
        this.getClientBySocket(client).setUser(us);
        this.getClientBySocket(client).setState(State.READY);
    }

    updateClient(us: any, client: Socket): void {
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
        this.timeoutList = this.timeoutList.filter(obj => obj._client._user.id !== user.id);
    }

    removeFromClientsBySocket(client: Socket) {
        this.clients = this.clients.filter(obj => obj._socket !== client);
    }

    removeFromClientsByUser(user: any) {
        this.clients = this.clients.filter(obj => obj._user.id !== user.id);
    }
}
