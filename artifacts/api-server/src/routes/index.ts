import { Router, type IRouter } from "express";
import healthRouter from "./health";
import progressRouter from "./progress";
import quizRouter from "./quiz";
import bookmarksRouter from "./bookmarks";
import glossaryRouter from "./glossary";
import searchRouter from "./search";

const router: IRouter = Router();

router.use(healthRouter);
router.use(progressRouter);
router.use(quizRouter);
router.use(bookmarksRouter);
router.use(glossaryRouter);
router.use(searchRouter);

export default router;
