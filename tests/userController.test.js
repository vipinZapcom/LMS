const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const {
  signup,
  login,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
} = require("../controllers/userController");

// Mock Response helper
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Mock all User model methods
// jest.mock("../models/user");
jest.spyOn(User, 'findOne').mockImplementation();
jest.spyOn(User, 'create').mockImplementation();
jest.spyOn(User, 'findById').mockImplementation();
jest.spyOn(User, 'findByIdAndUpdate').mockImplementation();
jest.spyOn(User, 'find').mockImplementation();
// jest.spyOn(User, 'save').mockImplementation();

/* jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
})); */

describe("User Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // ---------- SIGNUP ----------
  it("should signup a new user successfully", async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ id: "123", email: "test@example.com" });

    const req = {
      body: {
        name: "John",
        email: "test@example.com",
        password: "123",
        role: "user",
      },
    };
    const res = mockResponse();

    await signup(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(User.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should return 500 if any required field is missing", async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ id: "123", email: "test@example.com" });

    const req = {
      body: {
        email: "test@example.com",
        password: "123",
        role: "user",
      },
    };

    const res = mockResponse();
    await signup(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "All fields are required",
    });
  });

  it("should not signup if email exists", async () => {
    User.findOne.mockResolvedValue({ email: "test@example.com" });

    const req = {
      body: {
        name: "John",
        email: "test@example.com",
        password: "123",
        role: "user",
      },
    };
    const res = mockResponse();

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email already registered",
    });
  });

  it("should handle signup DB error", async () => {
    User.findOne.mockRejectedValue(new Error("DB error"));
    const req = {
      body: {
        name: "John",
        email: "test@example.com",
        password: "123",
        role: "user",
      },
    };
    const res = mockResponse();

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "DB error" });
  });

  // ---------- LOGIN ----------
  it("should login successfully", async () => {
    const mockUser = {
      email: "test@example.com",
      comparePassword: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockResolvedValue(mockUser);

    const req = { body: { email: "test@example.com", password: "123" } };
    const res = mockResponse();

    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Login successful",
    });
  });

  it("should return 404 if user not found on login", async () => {
    User.findOne.mockResolvedValue(null);
    const req = { body: { email: "notfound@example.com", password: "123" } };
    const res = mockResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should return 401 if password is incorrect", async () => {
    const mockUser = {
      comparePassword: jest.fn().mockResolvedValue(false),
    };
    User.findOne.mockResolvedValue(mockUser);

    const req = { body: { email: "test@example.com", password: "wrong" } };
    const res = mockResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should handle login DB error", async () => {
    User.findOne.mockRejectedValue(new Error("DB error"));
    const req = { body: { email: "test@example.com", password: "123" } };
    const res = mockResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ---------- GET USER ----------
  it("should get user by ID", async () => {
    User.findById.mockResolvedValue({ id: "123", email: "test@example.com" });
    const req = { params: { id: "123" } };
    const res = mockResponse();

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return 404 if user not found", async () => {
    User.findById.mockResolvedValue(null);
    const req = { params: { id: "123" } };
    const res = mockResponse();

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should handle DB error in getUserById", async () => {
    User.findById.mockResolvedValue(new Error("DB error"));
    const req = { params: { id: "123" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "DB error" });
  });

  // ---------- UPDATE USER ----------
  it("should update user successfully", async () => {
    User.findByIdAndUpdate.mockResolvedValue({ id: "123", name: "Updated" });
    const req = { params: { id: "123" }, body: { name: "Updated" } };
    const res = mockResponse();

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return 404 if updating non-existent user", async () => {
    User.findByIdAndUpdate.mockResolvedValue(null);
    const req = { params: { id: "123" }, body: { name: "Updated" } };
    const res = mockResponse();

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should handle DB error in updateUser", async () => {
    User.findByIdAndUpdate.mockRejectedValue(new Error("DB error"));
    const req = { params: { id: "123" }, body: { name: "Updated" } };
    const res = mockResponse();

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ---------- DELETE USER ----------
  it("should delete (deactivate) user successfully", async () => {
    User.findByIdAndUpdate.mockResolvedValue({ id: "123", isActive: false });
    const req = { params: { id: "123" } };
    const res = mockResponse();

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return 404 if deleting non-existent user", async () => {
    User.findByIdAndUpdate.mockResolvedValue(null);
    const req = { params: { id: "999" } };
    const res = mockResponse();

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should handle DB error in deleteUser", async () => {
    User.findByIdAndUpdate.mockRejectedValue(new Error("DB error"));
    const req = { params: { id: "123" } };
    const res = mockResponse();

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ---------- GET ALL USERS ----------
  it("should get all users successfully", async () => {
    User.find.mockResolvedValue([{ id: "1" }, { id: "2" }]);
    const req = {};
    const res = mockResponse();

    await getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should handle DB error in getAllUsers", async () => {
    User.find.mockRejectedValue(new Error("DB error"));
    const req = {};
    const res = mockResponse();

    await getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("should hash the password if modified", async () => {
    const user = new User({
      name: "John Doe",
      email: "john@example.com",
      password: "plainpassword",
      role: "user",
    });

    const originalHash = user.password;
    await user.save();
    expect(user.password).not.toBe(originalHash);
    expect(await bcrypt.compare("plainpassword", user.password)).toBe(true);
  });

 /*  it("should skip hashing if password is not modified", async () => {
    const user = new User({
      name: "Jane Doe",
      email: "jane@example.com",
      password: await bcrypt.hash("secret", 10),
      role: "user",
    });

    // Mock isModified to return false
    user.isModified = jest.fn().mockReturnValue(false);
console.log('MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM');
console.log(user.isModified);
console.log(user);
console.log('NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN');

    const next = jest.fn();
    await User.schema._middlewareFuncs[0].fn.call(user, next); // manually trigger pre-save hook
    expect(next).toHaveBeenCalled();
    expect(user.password).toBe(user.password); // unchanged
  }); */

  it("should correctly compare password", async () => {
    const password = "mypassword";
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      name: "Test",
      email: "test@example.com",
      password: hashed,
      role: "user",
    });

    const isMatch = await user.comparePassword(password);
    expect(isMatch).toBe(true);
  });
  it("should return false when password does not match", async () => {
    // Arrange
    // bcrypt.compare.mockResolvedValue(false); // Simulate mismatch
    jest.mock("bcrypt", () => ({
      compare: jest.fn(),
      hash: jest.fn(),
    }));

    const user = new User({ password: "hashedPassword123" });

    // Act
    const result = await user.comparePassword("wrongPassword");
    expect(result).toBe(false);
  });
});
