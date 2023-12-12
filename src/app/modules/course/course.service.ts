import { TCourse } from "./course.interface";
import Course from "./course.model";

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
    "durationInWeeks",
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
  const durationInWeeks = query?.durationInWeeks;
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

export const CourseServices = {
  createCourseIntoDB,
  getAllCoursesFromDB,
};
