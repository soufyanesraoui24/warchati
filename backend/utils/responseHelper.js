const success = (res, data, messageOrStatus, status) => {
  if (typeof messageOrStatus === 'number') {
    status = messageOrStatus;
    return res.status(status).json({ success: true, data });
  }
  return res.status(status || 200).json({ success: true, message: messageOrStatus, data });
};

const error = (res, message, status = 400) => {
  return res.status(status).json({
    success: false,
    message
  });
};

const paginate = (res, data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit) || 1;

  return res.status(200).json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
};

module.exports = { success, error, paginate, paginated: paginate };
