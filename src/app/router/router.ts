import express from "express";
import { CourseRoutes } from "../model/course/course.route";

const globalRouter = express.Router();

const routeList = [
  {
    path: "/course",
    route: CourseRoutes,
  },
];

routeList.forEach((route) => {
  globalRouter.use(route.path, route.route);
});

export default globalRouter;
