// frontend/src/components/UrlForm.js
import React, { useState } from 'react';
import axios from 'axios';

function UrlForm() {
  const [urls, setUrls] = useState(['', '', '']);
  const [metadata, setMetadata] = useState([]);
  const [error, setError] = useState(null);

  const handleInputChange = (index, event) => {
    const newUrls = [...urls];
    newUrls[index] = event.target.value;
    setUrls(newUrls);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/fetch-metadata', { urls });
      setMetadata(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch metadata.');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {urls.map((url, index) => (
          <input
            key={index}
            type="text"
            value={url}
            onChange={(event) => handleInputChange(index, event)}
            placeholder={`URL ${index + 1}`}
            required
          />
        ))}
        <button type="submit">Submit</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        {metadata.map((data, index) => (
          <div key={index}>
            <h3>{data.title}</h3>
            <p>{data.description}</p>
            {data.image && <img src={data.image} alt={data.title} />}
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
}

export default UrlForm;
