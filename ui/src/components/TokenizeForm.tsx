import { useState } from "react";
type Props = {
  disabled: boolean;
  onSubmit: (
    name: string,
    location: string,
    threeWordAddress: string,
    metadataURI: string,
    tiktokURL: string,
  ) => void;
};
export function TokenizeForm({
  disabled,
  onSubmit,
}: Props) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [threeWordAddress, setThreeWordAddress] = useState("");
  const [metadataURI, setMetadataURI] = useState("");
  const [tiktokURL, setTiktokURL] = useState("");
  const cleanName = name.trim();
  const cleanLocation = location.trim();
  const cleanThreeWordAddress = threeWordAddress.trim();
  const cleanMetadataURI = metadataURI.trim();
  const cleanTiktokURL = tiktokURL.trim();
  const ready =
    cleanName.length > 0 &&
    cleanLocation.length > 0 &&
    cleanThreeWordAddress.length > 0 &&
    cleanTiktokURL.length > 0;
  const validMetadataURI =
    cleanMetadataURI.length === 0 ||
    cleanMetadataURI.startsWith("ipfs://") ||
    cleanMetadataURI.startsWith("https://");
  const validTiktokURL =
    /^https:\/\/(www\.)?tiktok\.com\/.+/i.test(
      cleanTiktokURL,
    );
  const canSubmit =
    !disabled &&
    ready &&
    validMetadataURI &&
    validTiktokURL;
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    onSubmit(
      cleanName,
      cleanLocation,
      cleanThreeWordAddress,
      cleanMetadataURI,
      cleanTiktokURL,
    );
    setName("");
    setLocation("");
    setThreeWordAddress("");
    setMetadataURI("");
    setTiktokURL("");
  }
  return (
    <form
      className="card tokenize"
      onSubmit={handleSubmit}
    >
      <header>
        <h2>Register a home</h2>
        <p className="hint">
          Create a property record and connect it to a
          3 Word Address and TikTok video.
        </p>
      </header>
      <div className="row">
        <input
          aria-label="Home name"
          placeholder="Home name, e.g. Sea View Flat"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={disabled}
          maxLength={120}
          required
        />
        <input
          aria-label="Home location"
          placeholder="Location, e.g. Atlanta, GA"
          value={location}
          onChange={(event) =>
            setLocation(event.target.value)
          }
          disabled={disabled}
          maxLength={200}
          required
        />
      </div>
      <div className="row">
        <input
          aria-label="3 Word Address"
          placeholder="/// ocean.blue.home"
          value={threeWordAddress}
          onChange={(event) =>
            setThreeWordAddress(event.target.value)
          }
          disabled={disabled}
          maxLength={100}
          required
        />
      </div>
      <div className="row">
        <input
          aria-label="TikTok video URL"
          type="url"
          placeholder="TikTok property video URL"
          value={tiktokURL}
          onChange={(event) =>
            setTiktokURL(event.target.value)
          }
          disabled={disabled}
          maxLength={500}
          required
        />
        <button
          className="primary"
          type="submit"
          disabled={!canSubmit}
        >
          Register home
        </button>
      </div>
      {cleanTiktokURL.length > 0 &&
        !validTiktokURL && (
          <p className="warning">
            Enter a valid TikTok URL.
          </p>
        )}
      <details className="property-details">
        <summary>
          Add property details
        </summary>
        <div className="row">
          <input
            aria-label="Property metadata URI"
            type="url"
            placeholder="Property metadata URI, e.g. ipfs://..."
            value={metadataURI}
            onChange={(event) =>
              setMetadataURI(event.target.value)
            }
            disabled={disabled}
            maxLength={500}
          />
        </div>
        <p className="hint">
          Use an IPFS or HTTPS URI for additional property
          information, photos, amenities, or documents.
        </p>
        {cleanMetadataURI.length > 0 &&
          !validMetadataURI && (
            <p className="warning">
              Metadata URI must start with{" "}
              <code>ipfs://</code> or{" "}
              <code>https://</code>.
            </p>
          )}
      </details>
      <div className="tokenize-notice">
        <strong>What gets created</strong>
        <ul>
          <li>
            Your 3 Word Address provides a memorable
            location identifier.
          </li>
          <li>
            Your TikTok URL connects the property to its
            video listing.
          </li>
          <li>
            Optional metadata can contain additional
            property information, photos, amenities, and
            documents.
          </li>
          <li>
            Registration creates an on-chain property
            record. It does not establish legal title to
            real-world property.
          </li>
        </ul>
      </div>
    </form>
  );
}
