import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const navigate = useNavigate();

  async function fetchNotes() {
    const notes = await fetch("/api/note/all", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    setNotes(await notes.json());
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  function renderNote(note) {
    return (
      <div className="col" key={note.id}>
        <div
          className="card shadow-sm"
          onClick={() => navigate(`/note/${note.id}`)}
          style={{cursor: "pointer"}}
        >
          <div className="card-body">
            <p className="card-text">{note.note}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
        {notes.map((note) => renderNote(note))}
      </div>
    </div>
  );
}
