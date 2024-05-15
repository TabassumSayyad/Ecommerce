const Contact = require("../models/contactModel");
const paginate = require("../utils/pagination");

//add contact details
exports.createContact = async (req, res, next) => {
  try {
    const user = new Contact(req.body);
    const createContact = await user.save();
    res.status(201).json({ success: true, createContact });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

// get all contact details(Admin)
exports.getAllContacts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const contactData = await Contact.find().limit(limit).skip(startIndex);
    const count = await Contact.countDocuments();
    const totalPages = Math.ceil(count / limit);
    const pagination = paginate(startIndex, limit, count, page);
    res
      .status(201)
      .json({
        success: true,
        totalPages: totalPages,
        currentPage: page,
        totalContacts: count,
        pagination,
        contactData: contactData,
      });
  } catch (e) {
    res.status(400).json({ success: false, e });
  }
};


//update replied status(no -> yes)
exports.updateStatus = async (req, res, next) => {
  try {
    const updateContactStatus = await Contact.findByIdAndUpdate(
      req.params.id,
      { repliedStatus: true },
      { new: true }
    );
    if (!updateContactStatus) {
      return res.json({ success: false, error: "Contact not found" });
    }
    res.json({ success: true, updateContactStatus });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};
