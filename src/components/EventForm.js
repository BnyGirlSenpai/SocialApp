import React, { useState } from 'react';

const EventForm = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, description });
    setTitle('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea placeholder="Event Description" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
      <button type="submit">Submit</button>
    </form>
  );
};

export default EventForm;