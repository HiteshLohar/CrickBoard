import { getPublicLiveMatch } from "../services/publicMatch.service.js";

export const getPublicLiveMatchController = async (req, res, next) => {
  try {
    const { publicId } = req.params;

    const data = await getPublicLiveMatch(publicId);

    res.status(200).json({
      success: true,
      message: "Public live match fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};