import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import Login from "../components/Login.vue"
import Logout from "../views/Logout.vue";
import Game from '../components/Game.vue'
import GameBonus from '../components/GameBonus.vue'
import Queue from '../views/Queue.vue'
import Settings from "../views/Settings.vue";
import Profile from "..//views/Profile.vue";
import User from "../components/Users.vue"
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/profile",
    name: "Profile",
    component: Login,
  },
  {
    path: "/settings",
    name: "Settings",
    component: Settings,
  },
  {
    path: "/logout",
    name: "Logout",
    component: Logout,
  },
  {
    path: '/game', 
    name: 'Game',
    component: Game 
  },
  {
    path: '/game_bonus', 
    name: 'GameBonus',
    component: GameBonus
  },
  { 
    path: '/queue', 
    name: 'Queue',
    component: Queue 
  },
  {
    path: '/user/:user',
    name: 'User',
    component: User
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
