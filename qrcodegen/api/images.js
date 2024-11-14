// This is a new API to list all uploaded images stored in memory
export const handler = (req, res) => {
    // Respond with all images stored in memory
    return res.status(200).json(imagesMetadata);
  };
  
  export default handler;