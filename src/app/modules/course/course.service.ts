import httpStatus from "http-status";
import AppError from "../../error/AppError";
import Review from "../review/review.model";
import { TCourse } from "./course.interface";
import Course from "./course.model";
import mongoose, { Document } from "mongoose";

// create a course
const createCourseIntoDB = async (payload: TCourse) => {
  const result = await Course.create(payload);

  return result;
};

// get paginated, sorted & filtered courses
const getAllCoursesFromDB = async (query: Record<string, unknown>) => {
  // create query
  let courseQuery = Course.find();

  // apply pagination
  let page = Number(query?.page) || 1;
  let limit = Number(query?.limit) || 10;
  let skip = (page - 1) * limit;

  courseQuery = courseQuery.skip(skip).limit(limit);

  // apply sorting
  const sortProperties = [
    "title",
    "price",
    "startDate",
    "endDate",
    "language",
    "duration",
  ];

  const sortOrder = (query?.sortOrder as string) === "desc" ? "desc" : "asc";

  const sortByproperties = (query?.sortBy as string)?.split(",");

  let allowSort = true;

  // if the sort field is none of sortProperties, then not allow sorting
  sortByproperties?.forEach((element) => {
    if (!sortProperties.includes(element)) {
      allowSort = false;
    }
  });

  if (allowSort && sortByproperties) {
    // use sort:  [['field', 'asc'], ...]

    const sortArray: [string, "asc" | "desc"][] = sortByproperties.map(
      (element) => {
        return [element, sortOrder];
      },
    );

    courseQuery = courseQuery.sort(sortArray);
  }

  // apply minPrice, maxPrice filtering
  const minPrice = query?.minPrice;
  const maxPrice = query?.maxPrice;

  if (minPrice && maxPrice) {
    courseQuery = courseQuery.find({
      price: {
        $gte: minPrice,
        $lte: maxPrice,
      },
    });
  }

  // create filter object
  const filterObj: Record<string, unknown> = {};

  // apply tags filtering
  const tagName = query?.tags as string;

  if (tagName) {
    filterObj["tags.name"] = tagName;
  }

  // apply startDate, endDate filtering
  const startDate = query?.startDate;
  const endDate = query?.endDate;

  if (startDate && endDate && startDate <= endDate) {
    filterObj.startDate = {
      $gte: startDate,
    };

    filterObj.endDate = {
      $lte: endDate,
    };
  }

  // apply language, provider, durationInWeeks, level filtering
  const language = query?.language;
  const provider = query?.provider;
  const durationInWeeks = query?.duration;
  const level = query?.level;

  if (language) {
    filterObj.language = language;
  }
  if (provider) {
    filterObj.provider = provider;
  }
  if (durationInWeeks) {
    filterObj.durationInWeeks = durationInWeeks;
  }
  if (level) {
    filterObj["details.level"] = level;
  }

  courseQuery = courseQuery.find(filterObj);
  const result = await courseQuery.exec();

  return result;
};

// get course by id with reviews
const getCourseByIdWithReviewsFromDB = async (id: string) => {
  const result: Record<string, unknown> = {};

  const course = await Course.findById(id).select("-__v");
  const reviews = await Review.find({
    courseId: id,
  }).select({ courseId: 1, rating: 1, review: 1 });

  result.course = course;
  result.reviews = reviews;

  return result;
};

// get the best course based on average review
const getBestCourseFromDB = async () => {
  // create and start session
  const session = await mongoose.startSession();

  try {
    // start transaction
    session.startTransaction();

    // get bestCourse review - transaction 1
    const getBestCourse = await Review.aggregate([
      // stage 1 - group based on same course
      {
        $group: {
          _id: "$courseId",
          averageRating: {
            $avg: "$rating",
          },
          reviewCount: {
            $sum: 1,
          },
        },
      },

      // stage 2 - sort descending order based on averageRating
      {
        $sort: {
          averageRating: -1,
        },
      },

      // stage 3 - get the first review that has the highest average rating
      {
        $limit: 1,
      },

      // stage 4
      {
        $project: {
          courseId: 1,
          averageRating: 1,
          reviewCount: 1,
        },
      },
    ]).session(session);

    const { _id: bestCourseId, averageRating, reviewCount } = getBestCourse[0];

    if (!bestCourseId) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "No best course found based on rating",
      );
    }

    // get the best course - transaction 2
    const bestCourse: Document<any, any> | null = await Course.findById(
      bestCourseId,
    )
      .select("-__v")
      .session(session);

    if (bestCourse) {
      // convert mongoose Document to pure object
      const result = bestCourse.toObject();
      result.averageRating = averageRating;
      result.reviewCount = reviewCount;

      // commit transaction
      await session.commitTransaction();

      return result;
    }

    throw new AppError(
      httpStatus.NOT_FOUND,
      `No course found based on id: ${bestCourseId}`,
    );
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(httpStatus.BAD_REQUEST, error?.message);
  } finally {
    await session.endSession();
  }
};

// update course
const updateCourseIntoDB = async (id: string, payload: Partial<TCourse>) => {};

export const CourseServices = {
  createCourseIntoDB,
  getAllCoursesFromDB,
  getCourseByIdWithReviewsFromDB,
  getBestCourseFromDB,
};
