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
    cleanMetadataURI.length > 0 &&
    cleanTiktokURL.length > 0;

  const validMetadataURI =
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

  return (
    <form
      className="card tokenize"
      onSubmit={(event) => {
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
      }}
    >
      <header>
        <h2>Register a home</h2>

        <p className="hint">
          Create an on-chain property record with a
          memorable 3 Word Address and its TikTok video.
        </p>
      </header>

      <div className="row">
        <input
          aria-label="Home name"
          placeholder="Home name, e.g. Sea View Flat"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          disabled={disabled}
          maxLength={120}
          required
        />

        <input
          aria-label="Home location"
          placeholder="Location, e.g. Kadikoy, Istanbul"
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
          placeholder="3 Word Address, e.g. /// ocean.blue.home"
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
          placeholder="TikTok video URL"
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
            Enter a valid TikTok URL, for example
            https://www.tiktok.com/@creator/video/123456789
          </p>
        )}

      <div className="row">
        <input
          aria-label="Property metadata URI"
          placeholder="Property metadata URI, e.g. ipfs://..."
          value={metadataURI}
          onChange={(event) =>
            setMetadataURI(event.target.value)
          }
          disabled={disabled}
          maxLength={500}
          required
        />
      </div>

      {cleanMetadataURI.length > 0 &&
        !validMetadataURI && (
          <p className="warning">
            Metadata URI must start with{" "}
            <code>ipfs://</code> or{" "}
            <code>https://</code>.
          </p>
        )}

      <div className="tokenize-notice">
        <strong>Property record</strong>

        <ul>
          <li>
            The 3 Word Address gives the home a memorable
            location identifier.
          </li>

          <li>
            The TikTok URL connects the property to its
            video listing.
          </li>

          <li>
            The metadata URI can contain additional
            property information, photos, amenities, and
            documents.
          </li>

          <li>
            Registration creates an on-chain property
            record. It does not by itself establish legal
            title to real-world property.
          </li>
        </ul>
      </div>
    </form>
  );
}
