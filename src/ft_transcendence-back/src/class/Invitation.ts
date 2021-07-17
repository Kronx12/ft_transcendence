import { Socket } from "dgram";
import { Client, send } from "./Utils";

export enum InvitationState {
    ACCEPTED,
    WAITING,
    DECLINED
}

export enum GameType {
    NORMAL,
    BONUS,
}

export class Invitation {
    _transmitter: number;
    _transmitter_socket: Client;
    _receiver: number;
    _receiver_socket: Client;
    _state: InvitationState = InvitationState.WAITING;
    _game_type: GameType;
    _timeout: 60;

    constructor(transmitter: number, transmitter_socket: Client, receiver: number, receiver_socket: Client, game_type: GameType) {
        this._transmitter = transmitter;
        this._transmitter_socket = transmitter_socket;
        this._receiver = receiver;
        this._receiver_socket = receiver_socket;
        this._state = InvitationState.WAITING;
        this._game_type = game_type;
        send(this._transmitter_socket._socket, "invitation_send", {transmitter: this._transmitter, receiver: this._receiver, type: this._game_type})
        send(this._receiver_socket._socket, "invitation_send", {transmitter: this._transmitter, receiver: this._receiver, type: this._game_type})
        
    }

    accept() {
        this._state = InvitationState.ACCEPTED
        send(this._transmitter_socket._socket, "invitation_accepted", {transmitter: this._transmitter, receiver: this._receiver, type: this._game_type})
        send(this._receiver_socket._socket, "invitation_accepted", {transmitter: this._transmitter, receiver: this._receiver, type: this._game_type})
    }

    decline() {
        this._state = InvitationState.DECLINED
        send(this._transmitter_socket._socket, "invitation_declined", {transmitter: this._transmitter, receiver: this._receiver, type: this._game_type})
        send(this._receiver_socket._socket, "invitation_declined", {transmitter: this._transmitter, receiver: this._receiver, type: this._game_type})
    }
}