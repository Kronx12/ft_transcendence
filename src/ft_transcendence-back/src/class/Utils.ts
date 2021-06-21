import { Socket } from "dgram";

export enum State {
    NEED_USER,
    WAITING,
    READY
}

export class Client {
    _socket: Socket;
    _user: any;
    _state: State;

    constructor(us?: any, sock?: Socket, state?: State) {
        this._socket = sock;
        this._user = us;
        this._state = state;
    }

    setSocket(s: Socket) { this._socket = s;}
    setUser(u: any)      { this._user = u;  }
    setState(s: State)      { this._state = s;  }

    getSocket(): Socket { return this._socket;  }
    getUser() : any     { return this._user;    }
    getState() : State  { return this._state;    }

    compareByUser(us: any): boolean {
        if (this._user == null)
            return false;
        return (us.id === this._user.id);
    }
    compareBySocket(s: Socket): boolean {
        if (this._socket == null)
            return false;
        return (s === this._socket);
    }
}

export class Room {
    _id: string;

    _scorea: number;
    _scoreb: number;

    _playerax: number;
    _playeray: number;

    _playerbx: number;
    _playerby: number;

    _playera: Client;
    _playerb: Client;

    _bx: number;
    _by: number;
    _br: number;

    _vx: number;
    _vy: number;

    _spectators: Client[]; // TODO

    _canvas_w: number;
    _canvas_h: number;

    constructor(p1: Client, p2: Client) {
        this._id = uuidv4();

        this._canvas_w = 1000
        this._canvas_h = 562

        this._scorea = 0;
        this._scoreb = 0;

        this._playera = p1;
        this._playerb = p2;

        this._playerax = 0;
        this._playeray = 0;

        this._playerbx = 0;
        this._playerby = 0;
    
        this._spectators = [];

        this._vx = 1;
        this._vy = 1;
    
        this._br = 5;
        this._bx = this._canvas_w / 2;
        this._by = this._canvas_h / 2;
    }

    setup() {
        send(this._playera._socket, "emit_start", {room_id: this._id, server_width: this._canvas_w, server_height: this._canvas_h});
        send(this._playerb._socket, "emit_start", {room_id: this._id, server_width: this._canvas_w, server_height: this._canvas_h});
    }

    async update_game() {
        let fps = 30;
        while (true) {
            // Update ball

            // TODO Check racket + victory
            if (this._vx + this._bx < this._br || this._vx + this._bx > this._canvas_w - this._br)
                this._vx *= -1;
            if (this._vy + this._by < this._br || this._vy + this._by > this._canvas_h - this._br)
                this._vy *= -1;
            this._bx += this._vx;
            this._by += this._vy;

            // Broadcast
            send(this._playerb._socket, "ack_loop", { sa: this._scorea, sb: this._scoreb, bx: this._bx, by: this._by, pay: this._playeray, pby: this._playerby });
            send(this._playera._socket, "ack_loop", { sa: this._scorea, sb: this._scoreb, bx: this._bx, by: this._by, pay: this._playeray, pby: this._playerby });
            this._spectators.forEach(spec => { send(spec._socket, "ack_loop", { sa: this._scorea, sb: this._scoreb, bx: this._bx, by: this._by, pay: this._playeray, pby: this._playerby }); });
            await new Promise(resolve => setTimeout(resolve, 1000 / 30));
        }
    }

    update(user: any, key: number) {
        let speed = 3;
        if (user.id === this._playera._user.id) {
            if (key == 38) // up
                this._playeray -= speed;
            if (key == 40) // down
                this._playeray += speed;
        } else if (user.id === this._playerb._user.id) {
            if (key == 38) // up
                this._playerby -= speed;
            if (key == 40) // down
                this._playerby += speed;
        }
    }

    isPlayerA(p: Client) : boolean {
        if (this._playera._user.id === p._user.id)
            return true;
        return false;
    }

    isPlayerB(p: Client) : boolean {
        if (this._playerb._user.id === p._user.id)
            return true;
        return false;
    }

    updatePlayerA(x:number, y:number): void {
        this._playerax = x;
        this._playerax = y;
    }

    updatePlayerB(x:number, y:number): void {
        this._playerbx = x;
        this._playerbx = y;
    }
}

export class Queue {
    _store: Client[] = [];

    constructor() {}

    push(c: Client) { this._store.push(c); }
    pop(): void { this._store.pop(); }

    isInQueue(user: any): boolean {
        for (let i = 0; i < this._store.length; i++)
            if (this._store[i]._user.id === user.id)
                return (true);
        return (false);
    }

    removeBySocket(client: Socket): void {
        this._store = this._store.filter(obj => obj._socket !== client);
    }

    removeByUser(user: any): void {
        this._store = this._store.filter(obj => obj._user.id !== user.id);
    }
} 

export class ClientTimeout {
    _client: Client;
    _timeout: number;

    constructor (client: Client) {
        this._timeout = 5;
        this._client = client;
    }
}

export function uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function send(client: Socket, t: string, data?: any) {
    client.send(JSON.stringify({type: t, content: data}));
}
