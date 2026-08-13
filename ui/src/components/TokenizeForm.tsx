import { useState } from "react";

type Props = {
  disabled: boolean;
  onSubmit: (name: string, location: string) => void;
};

export function TokenizeForm({ disabled, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const ready = name.trim().length > 0 && location.trim().length > 0;

  return (
    <form
      className="card tokenize"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(name.trim(), location.trim());
        setName("");
        setLocation("");
      }}
    >
      <h2>Tokenize a home</h2>
      <div className="row">
        <input
          placeholder="Name, e.g. Sea view flat"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <input
          placeholder="Location, e.g. Kadikoy, Istanbul"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />
        <button className="primary" type="submit" disabled={disabled || !ready}>
          Tokenize
        </button>
      </div>
      <p className="hint">
        You become the landlord of the new home. Metadata is stored as you type it and is
        never checked against a land registry.
      </p>
    </form>
  );
}
