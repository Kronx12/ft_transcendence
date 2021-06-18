import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import Login from "../components/Login.vue"
import Logout from "../views/Logout.vue";
import Game from '../components/Game.vue'
import Queue from '../views/Queue.vue'
import Settings from "../views/Settings.vue";

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
    path: '/queue', 
    name: 'Queue',
    component: Queue 
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
