export default function handler(req, res) {
    // Send a response with status 200 and a JSON object
    let pet
    const fetchData = () => {
      const pets = `SELECT * FROM Pets;`;
      pet = pets
    }
    fetchData()
    res.status(200).json({ pet });
  }
  