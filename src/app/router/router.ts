import express from "express";
import { CourseRoutes } from "../modules/course/course.route";
import { CategoryRoutes } from "../modules/category/category.route";

const globalRouter = express.Router();

const routeList = [
  {
    path: "/course",
    route: CourseRoutes,
  },
  {
    path: "/categories",
    route: CategoryRoutes,
  },
];

routeList.forEach((route) => {
  globalRouter.use(route.path, route.route);
});

export default globalRouter;
