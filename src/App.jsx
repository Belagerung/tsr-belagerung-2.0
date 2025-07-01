
import React from "react";

function App() {
  const [eintraege, setEintraege] = React.useState([
    { bedingungen: "" }
  ]);
  const [bearbeiten, setBearbeiten] = React.useState(true);

  const handleInputChange = (index, field, value) => {
    const updated = [...eintraege];
    updated[index][field] = value;
    setEintraege(updated);
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Bedingungen und Fallen</th>
        </tr>
      </thead>
      <tbody>
        {eintraege.map((eintrag, index) => (
          <tr key={index}>
            <td>
              <input
                type="text"
                value={eintrag.bedingungen || ""}
                onChange={(e) => handleInputChange(index, "bedingungen", e.target.value)}
                disabled={!bearbeiten}
                style={{ width: "100%", minWidth: "250px" }}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default App;
