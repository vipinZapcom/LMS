const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const CourseAssignment = require("../models/courseAssignment"); // Adjust path if needed
const Course = require("../models/course"); // Adjust path if needed
const Group = require("../models/group"); // Adjust path if needed

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await CourseAssignment.deleteMany();
  await Course.deleteMany();
  await Group.deleteMany();
});

describe("CourseAssignment Model", () => {
  it("should create a CourseAssignment successfully", async () => {
    const course = await Course.create({
      name: "Node.js Basics",
      videoUrl: "https://www.youtube.com/watch?v=FdaVsce3ftQ",
      title: "Node.js Basics",
    });
    const group = await Group.create({ name: "Group A" });

    console.log("Course ID:", course._id);
    console.log("Group ID:", group._id);
    const assignment = new CourseAssignment({
      course: course._id,
      group: group._id,
    });

    const savedAssignment = await assignment.save();

    expect(savedAssignment._id).toBeDefined();
    expect(savedAssignment.course.toString()).toBe(course._id.toString());
    expect(savedAssignment.group.toString()).toBe(group._id.toString());
  });

  it("should fail if course is missing", async () => {
    const group = await Group.create({ name: "Group B" });

    let err;
    try {
      await CourseAssignment.create({ group: group._id });
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.course).toBeDefined();
  });

  it("should fail if group is missing", async () => {
    const course = await Course.create({ 
      name: "MongoDB Intro",
      videoUrl: "https://www.youtube.com/watch?v=FdaVsce3ftQ",
      title: "Node.js Basics",
     });

    let err;
    try {
      await CourseAssignment.create({ course: course._id });
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.group).toBeDefined();
  });

  it("should set assignedAt by default", async () => {
    const course = await Course.create({
      name: "Express.js Guide",
      videoUrl: "https://watch?v=FdaVsce3ftQ",
      title: "Node.js Basics",
    });
    const group = await Group.create({ name: "Group C" });

    const assignment = await CourseAssignment.create({
      course: course._id,
      group: group._id,
    });

    expect(assignment.assignedAt).toBeDefined();
    expect(assignment.assignedAt).toBeInstanceOf(Date);
  });

  it("should populate course and group fields", async () => {
    const course = await Course.create({
      name: "React Fundamentals",
      videoUrl: "https://watch?v=FdaVsce3ftQ",
      title: "React Fundamentals",
    });
    const group = await Group.create({ name: "Group D" });
console.log("***************************************");
console.log(course);
console.log(group);


console.log("***************************************");

    const assignment = await CourseAssignment.create({
      course: course._id,
      group: group._id,
    });
    console.log(`assignment`);
    console.log(assignment);

    const populatedAssignment = await CourseAssignment.findById(assignment._id)
      .populate("course")
      .populate("group");

    console.log("Populated Assignment:", populatedAssignment.course);

    expect(populatedAssignment.course.title).toBe("React Fundamentals");
    expect(populatedAssignment.group.name).toBe("Group D");
  });
});
