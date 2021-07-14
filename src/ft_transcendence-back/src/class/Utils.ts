import { Redirect } from "@nestjs/common";
import { Socket } from "dgram";
import fetch from 'node-fetch';

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

    _racket_w: number;
    _racket_h: number;

    _bx: number;
    _by: number;
    _br: number;

    _vx: number;
    _vy: number;

    _spectators: Socket[]; // TODO

    _canvas_w: number;
    _canvas_h: number;

    _end: boolean;
    _start: boolean;
    _start_chrono: number;

    _scorelimit: number;

    _winner: any;

    constructor(p1: Client, p2: Client) {
        this._id = uuidv4();

        this._scorelimit = 11

        this._canvas_w = 1000
        this._canvas_h = 562

        this._scorea = 0;
        this._scoreb = 0;

        this._playera = p1;
        this._playerb = p2;

        this._racket_w = 2 * this._canvas_w / 100;
        this._racket_h = 15 * this._canvas_h / 100;

        this.resetRacket();

        this._spectators = [];

        this.resetBall();
        this._br = 5;

        this._end = false;
        this._start = false;
        this._start_chrono = 3000; // Decompte en ms
    }

    setup() {
        send(this._playera._socket, "emit_start_standard", {room_id: this._id});
        send(this._playerb._socket, "emit_start_standard", {room_id: this._id});
        this._spectators.forEach(e => {
            send(e, "emit_start_standard", {room_id: this._id});
        });
    }

    addSpectator(s: Socket) {
        if (s != this._playera._socket && s != this._playerb._socket)
            this._spectators.push(s)
    }

    removeSpectator(s: Socket) {
        const index = this._spectators.indexOf(s, 0);
        if (index > -1) {
            this._spectators.splice(index, 1);
        }
    }

    async update_game() {
        let fps = 30;
        while (true) {
            if (this._start) {
                // Update ball
                
                let racketa = { x: this._playerax, y: this._playeray, w: this._racket_w, h: this._racket_h };
                let racketb = { x: this._playerbx, y: this._playerby, w: this._racket_w, h: this._racket_h };
                let ball = { x: this._bx + this._vx, y: this._by + this._vy, r: this._br };

                if (RectCircleColliding(ball, racketa) || RectCircleColliding(ball, racketb) ||
                    this._vx + this._bx < this._br || this._vx + this._bx > this._canvas_w - this._br)
                    this._vx *= -1;
                
                if (this._vy + this._by < this._br || this._vy + this._by > this._canvas_h - this._br) {
                    this._vy *= -1;
                } else if (RectCircleColliding(ball, racketa)) {
                    let diffy = (this._playeray + this._racket_h / 2 - this._by) * -0.5;
                    this._vy = this._vx * getTanFromDegrees(diffy)
                } else if (RectCircleColliding(ball, racketb)) {
                    let diffy = (this._playerby + this._racket_h / 2 - this._by) * 0.5;
                    this._vy = this._vx * getTanFromDegrees(diffy)
                }

                

                if (this._bx - this._br + this._vx <= this._racket_w) {
                    this._scoreb += 1;
                    this.resetBall();
                    this.resetRacket();
                } else if (this._bx + this._br + this._vx >= this._canvas_w - this._racket_w) {
                    this._scorea += 1;
                    this.resetBall();
                    this.resetRacket();
                }

                if (this._scorea == this._scorelimit || this._scorea == -1 || this._scoreb == this._scorelimit || this._scoreb == -1) {
                    this._start = false;
                    this._start_chrono = 5000;
                    this._end = true;
                    this._winner = (this._scorea == this._scorelimit || this._scoreb == -1) ? this._playera._user : this._playerb._user;
                    await saveGame({
                        "uuid": this._id,
                        "player_1": this._playera._user.id,
                        "player_2": this._playerb._user.id,
                        "score_1": this._scorea,
                        "score_2": this._scoreb,
                        "victory": this._winner.id,
                        "type": 0
                    }, this._id, this._playera._user.id, this._playerb._user.id);
                }

                this._bx += this._vx;
                this._by += this._vy;

            } else {
                this._start_chrono -= 1000 / fps;
                if (this._start_chrono <= 0 && !this._end)
                    this._start = true;
                else if (this._start_chrono <= 0) {
                    console.log(this._winner);
                    send(this._playerb._socket, "ack_leave", { room_id: this._id });
                    send(this._playera._socket, "ack_leave", { room_id: this._id });
                    this._spectators.forEach(spec => { send(spec, "ack_leave", { room_id: this._id }); });
                    break;
                }
            }
            
            // Broadcast
            send(this._playerb._socket, "ack_loop", { room_id: this._id, isA: false, isB: true, server_width: this._canvas_w, server_height: this._canvas_h, end: this._end, start: this._start, start_chrono: this._start_chrono, sa: this._scorea, sb: this._scoreb, bx: this._bx, by: this._by, pax: this._playerax, pbx: this._playerbx, pay: this._playeray, pby: this._playerby, rw: this._racket_w, rh: this._racket_h, win: this._winner });
            send(this._playera._socket, "ack_loop", { room_id: this._id, isA: true, isB: false, server_width: this._canvas_w, server_height: this._canvas_h, end: this._end, start: this._start, start_chrono: this._start_chrono, sa: this._scorea, sb: this._scoreb, bx: this._bx, by: this._by, pax: this._playerax, pbx: this._playerbx, pay: this._playeray, pby: this._playerby, rw: this._racket_w, rh: this._racket_h, win: this._winner });
            this._spectators.forEach(spec => { send(spec, "ack_loop", { room_id: this._id, isA: false, isB: false, server_width: this._canvas_w, server_height: this._canvas_h, end: this._end, start: this._start, start_chrono: this._start_chrono, sa: this._scorea, sb: this._scoreb, bx: this._bx, by: this._by, pax: this._playerax, pbx: this._playerbx, pay: this._playeray, pby: this._playerby, rw: this._racket_w, rh: this._racket_h, win: this._winner }); });
            
            await new Promise(resolve => setTimeout(resolve, 1000 / fps));
        }
    }

    update(user: any, key: number) {
        let speed = 5;
        if (user.id === this._playera._user.id) {
            if (key == 38 && this._playeray > 0) // up
                this._playeray -= speed;
            if (key == 40 && this._playeray + this._racket_h < this._canvas_h) // down
                this._playeray += speed;
        } else if (user.id === this._playerb._user.id) {
            if (key == 38 && this._playerby > 0) // up
                this._playerby -= speed;
            if (key == 40 && this._playerby + this._racket_h < this._canvas_h) // down
                this._playerby += speed;
        }
    }

    resetBall() {
        let rdm = Math.random();

        this._vy = 0;
        if (rdm > 0.5) 
            this._vx = 20;
        else 
            this._vx = -20;
        this._bx = this._canvas_w / 2;
        this._by = this._canvas_h / 2;
    }

    resetRacket() {
        this._playerax = this._racket_w * 3;
        this._playeray = (this._canvas_h / 2) - (this._racket_h / 2);

        this._playerbx = this._canvas_w - (this._racket_w * 4);
        this._playerby = (this._canvas_h / 2) - (this._racket_h / 2);
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

    stopPA() {
        this._scorea = -1;
    }

    stopPB() {
        this._scoreb = -1;
    }
}


export class RoomBonus {
    _id: string;

    _scorea: number;
    _scoreb: number;

    _playerax: number;
    _playeray: number;

    _playerbx: number;
    _playerby: number;

    _playera: Client;
    _playerb: Client;

    _racket_w: number;
    _racket_h: number;

    _bx: number;
    _by: number;
    _br: number;

    _vx: number;
    _vy: number;

    _spectators: Client[]; // TODO

    _racket_speed: number;
    _racket_freeze_speed: number;

    _racket_speeda: number;
    _racket_speedb: number;
    
    _canvas_w: number;
    _canvas_h: number;

    _end: boolean;
    _start: boolean;
    _start_chrono: number;

    _scorelimit: number;

    _winner: any;

    _limit_cooldown: number;
    _limit_cooldown_freeze: number;
    _cooldowna: number;
    _cooldown_freeze_a: number;
    _cooldownb: number;
    _cooldown_freeze_b: number;

    constructor(p1: Client, p2: Client) {
        this._id = uuidv4();

        this._scorelimit = 11

        this._canvas_w = 1000
        this._canvas_h = 562

        this._scorea = 0;
        this._scoreb = 0;

        this._playera = p1;
        this._playerb = p2;

        this._racket_w = 2 * this._canvas_w / 100;
        this._racket_h = 15 * this._canvas_h / 100;

        this.resetRacket();

        this._limit_cooldown_freeze = 3000;
        this._limit_cooldown = 5000;
        this._cooldowna = this._limit_cooldown;
        this._cooldown_freeze_a = 0;
        this._cooldownb = this._limit_cooldown;
        this._cooldown_freeze_b = 0;
    
        this._racket_speed = 5;
        this._racket_freeze_speed = 2;

        this._racket_speeda = this._racket_speed;
        this._racket_speedb = this._racket_speed;

        this._spectators = [];

        this.resetBall();
        this._br = 5;

        this._end = false;
        this._start = false;
        this._start_chrono = 3000; // Decompte en ms
    }

    setup() {
        send(this._playera._socket, "emit_start_bonus", {room_id: this._id});
        send(this._playerb._socket, "emit_start_bonus", {room_id: this._id});
    }

    async update_game() {
        let fps = 30;
        while (true) {
            if (this._start) {
                // Update ball
                
                let racketa = { x: this._playerax, y: this._playeray, w: this._racket_w, h: this._racket_h };
                let racketb = { x: this._playerbx, y: this._playerby, w: this._racket_w, h: this._racket_h };
                let ball = { x: this._bx + this._vx, y: this._by + this._vy, r: this._br };

                if (RectCircleColliding(ball, racketa) || RectCircleColliding(ball, racketb) ||
                    this._vx + this._bx < this._br || this._vx + this._bx > this._canvas_w - this._br)
                    this._vx *= -1;
                
                if (this._vy + this._by < this._br || this._vy + this._by > this._canvas_h - this._br) {
                    this._vy *= -1;
                } else if (RectCircleColliding(ball, racketa)) {
                    let diffy = (this._playeray + this._racket_h / 2 - this._by) * -0.5;
                    this._vy = this._vx * getTanFromDegrees(diffy)
                } else if (RectCircleColliding(ball, racketb)) {
                    let diffy = (this._playerby + this._racket_h / 2 - this._by) * 0.5;
                    this._vy = this._vx * getTanFromDegrees(diffy)
                }

                if (this._bx - this._br + this._vx <= this._racket_w) {
                    this._scoreb += 1;
                    this.resetBall();
                    this.resetRacket();
                    this._cooldown_freeze_a = 0;
                    this._cooldown_freeze_b = 0;
                    this._cooldowna = this._limit_cooldown;
                    this._cooldownb = this._limit_cooldown;
                } else if (this._bx + this._br + this._vx >= this._canvas_w - this._racket_w) {
                    this._scorea += 1;
                    this.resetBall();
                    this.resetRacket();
                    this._cooldown_freeze_a = 0;
                    this._cooldown_freeze_b = 0;
                    this._cooldowna = this._limit_cooldown;
                    this._cooldownb = this._limit_cooldown;
                }

                if (this._scorea == this._scorelimit || this._scorea == -1 || this._scoreb == this._scorelimit || this._scoreb == -1) {
                    this._start = false;
                    this._start_chrono = 5000;
                    this._end = true;
                    this._winner = (this._scorea == this._scorelimit || this._scoreb == -1) ? this._playera._user : this._playerb._user;
                    await saveGame({
                        "uuid": this._id,
                        "player_1": this._playera._user.id,
                        "player_2": this._playerb._user.id,
                        "score_1": this._scorea,
                        "score_2": this._scoreb,
                        "victory": this._winner.id,
                        "type": 1
                    }, this._id, this._playera._user.id, this._playerb._user.id);
                }

                this._bx += this._vx;
                this._by += this._vy;

                this._cooldown_freeze_a -= 1000 / fps;
                this._cooldown_freeze_b -= 1000 / fps;
                this._cooldowna -= 1000 / fps;
                this._cooldownb -= 1000 / fps;
                if (this._cooldown_freeze_a <= 0) {
                    this._cooldown_freeze_a = 0
                    this._racket_speeda = this._racket_speed;
                } else {
                    this._racket_speeda = this._racket_freeze_speed;
                }

                if (this._cooldown_freeze_b <= 0) {
                    this._cooldown_freeze_b = 0
                    this._racket_speedb = this._racket_speed;
                } else {
                    this._racket_speedb = this._racket_freeze_speed;
                }
                
                if (this._cooldowna <= 0)
                    this._cooldowna = 0;
                if (this._cooldownb <= 0)
                    this._cooldownb = 0;

            } else {
                this._start_chrono -= 1000 / fps;                

                if (this._start_chrono <= 0 && !this._end)
                    this._start = true;
                else if (this._start_chrono <= 0) {
                    console.log(this._winner);
                    send(this._playerb._socket, "ack_leave", { room_id: this._id });
                    send(this._playera._socket, "ack_leave", { room_id: this._id });
                    this._spectators.forEach(spec => { send(spec._socket, "ack_leave", { room_id: this._id }); });
                    break;
                }
            }
            
            // Broadcast
            send(this._playerb._socket, "ack_loop", {
                room_id: this._id, 
                isA: false, 
                isB: true, 
                cooldowna: this._cooldowna * 100 / this._limit_cooldown, 
                cooldownb: this._cooldownb * 100 / this._limit_cooldown, 
                server_width: this._canvas_w, 
                server_height: this._canvas_h, 
                end: this._end, 
                start: this._start, 
                start_chrono: this._start_chrono, 
                sa: this._scorea, 
                sb: this._scoreb, 
                bx: this._bx, 
                by: this._by, 
                pax: this._playerax, 
                pbx: this._playerbx, 
                pay: this._playeray, 
                pby: this._playerby, 
                rw: this._racket_w, 
                rh: this._racket_h, 
                win: this._winner
            });
            send(this._playera._socket, "ack_loop", { 
                room_id: this._id,
                isA: true, 
                isB: false, 
                cooldowna: this._cooldowna * 100 / this._limit_cooldown, 
                cooldownb: this._cooldownb * 100 / this._limit_cooldown, 
                server_width: this._canvas_w, 
                server_height: this._canvas_h, 
                end: this._end, 
                start: this._start, 
                start_chrono: this._start_chrono, 
                sa: this._scorea, 
                sb: this._scoreb, 
                bx: this._bx,
                by: this._by,
                pax: this._playerax, 
                pbx: this._playerbx, 
                pay: this._playeray, 
                pby: this._playerby, 
                rw: this._racket_w, 
                rh: this._racket_h, 
                win: this._winner
            });
            this._spectators.forEach(spec => { send(spec._socket, "ack_loop", { 
                room_id: this._id,
                isA: false, 
                isB: false, 
                cooldowna: this._cooldowna * 100 / this._limit_cooldown, 
                cooldownb: this._cooldownb * 100 / this._limit_cooldown, 
                server_width: this._canvas_w, 
                server_height: this._canvas_h,
                end: this._end, 
                start: this._start, 
                start_chrono: this._start_chrono, 
                sa: this._scorea, 
                sb: this._scoreb, 
                bx: this._bx, 
                by: this._by, 
                pax: this._playerax, 
                pbx: this._playerbx, 
                pay: this._playeray, 
                pby: this._playerby, 
                rw: this._racket_w, 
                rh: this._racket_h, 
                win: this._winner
            }); });
            
            await new Promise(resolve => setTimeout(resolve, 1000 / fps));
        }
    }

    update(user: any, key: number, space: boolean) {
        if (user.id === this._playera._user.id) {
            if (key == 38 && this._playeray > 0) // up
                this._playeray -= this._racket_speeda;
            if (key == 40 && this._playeray + this._racket_h < this._canvas_h) // down
                this._playeray += this._racket_speeda;
            if (space && this._cooldowna <= 0) {
                console.log("Press Space");
                this._cooldowna = this._limit_cooldown;
                this._cooldown_freeze_b = this._limit_cooldown_freeze;
            }
        } else if (user.id === this._playerb._user.id) {
            if (key == 38 && this._playerby > 0) // up
                this._playerby -= this._racket_speedb;
            if (key == 40 && this._playerby + this._racket_h < this._canvas_h) // down
                this._playerby += this._racket_speedb;
            if (space && this._cooldownb <= 0) {
                console.log("Press Space");
                this._cooldownb = this._limit_cooldown;
                this._cooldown_freeze_a = this._limit_cooldown_freeze;
            }
        }

    }

    resetBall() {
        let rdm = Math.random();

        this._vy = 0;
        if (rdm > 0.5) 
            this._vx = 20;
        else 
            this._vx = -20;
        this._bx = this._canvas_w / 2;
        this._by = this._canvas_h / 2;
    }

    resetRacket() {
        this._playerax = this._racket_w * 3;
        this._playeray = (this._canvas_h / 2) - (this._racket_h / 2);

        this._playerbx = this._canvas_w - (this._racket_w * 4);
        this._playerby = (this._canvas_h / 2) - (this._racket_h / 2);
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

    stopPA() {
        this._scorea = -1;
    }

    stopPB() {
        this._scoreb = -1;
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

export function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

export function RectCircleColliding(circle,rect){
    var distX = Math.abs(circle.x - rect.x-rect.w/2);
    var distY = Math.abs(circle.y - rect.y-rect.h/2);

    if (distX > (rect.w/2 + circle.r)) { return false; }
    if (distY > (rect.h/2 + circle.r)) { return false; }

    if (distX <= (rect.w/2)) { return true; } 
    if (distY <= (rect.h/2)) { return true; }

    var dx=distX-rect.w/2;
    var dy=distY-rect.h/2;
    return (dx*dx+dy*dy<=(circle.r*circle.r));
}

export function getTanFromDegrees(degrees) {
    return Math.tan(degrees * Math.PI / 180);
}

export async function saveGame(content, uuid:string, p1:number, p2:number) {
    const response = await fetch("http://localhost:3000/game_database", {
        method: 'POST',
        body: JSON.stringify(content),
        headers: { 'Content-Type': 'application/json; charset=UTF-8' }
    });
    const response_getid = await fetch("http://localhost:3000/game_database/getid/" + uuid)
    .then(res => res.json())
    .then(json => {    
        fetch("http://localhost:3000/database/user/game/" + p1.toString() + "/" + json.id.toString(), {
            method: 'PATCH',
            body: JSON.stringify(content),
            headers: { 'Content-Type': 'application/json; charset=UTF-8' }
        });
        fetch("http://localhost:3000/database/user/game/" + p2.toString() + "/" + json.id.toString(), {
            method: 'PATCH',
            body: JSON.stringify(content),
            headers: { 'Content-Type': 'application/json; charset=UTF-8' }
        });
    });
}