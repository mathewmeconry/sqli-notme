import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import Content from "../components/Content";

export default function Note() {
  const params = useParams();
  const [note, setNote] = useState();
  const navigate = useNavigate();

  async function save() {
    await fetch(`/api/note/update`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(note),
      credentials: "include",
    });
    navigate("/notes");
  }

  useEffect(() => {
    async function func() {
      const resp = await fetch(`/api/note/${params.id}`);
      const json = await resp.json();
      setNote(json);
    }
    func();
  }, [params.id]);

  if (!note) {
    return (
      <Content>
        <h1>Loading note #{params.id}</h1>
      </Content>
    );
  }

  return (
    <Content>
      <h1>Note #{params.id}</h1>
      <div className="form-floating">
        <textarea
          className="form-control"
          id="floatingInput"
          placeholder="Note"
          value={note.note}
          onChange={(e) => setNote({...note, note: e.currentTarget.value})}
        />
        <label htmlFor="floatingInput">Note</label>
      </div>
      <br />
      <button
        className="w-100 btn btn-lg btn-primary"
        type="submit"
        onClick={save}
      >
        Update
      </button>
    </Content>
  );
}
