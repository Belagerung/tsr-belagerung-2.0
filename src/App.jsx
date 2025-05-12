
import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCNVaChrUPz4gQRj5zBn7_Z6KrlDImk37E",
  authDomain: "augustus-rex-belagerungsplan.firebaseapp.com",
  projectId: "augustus-rex-belagerungsplan",
  storageBucket: "augustus-rex-belagerungsplan.appspot.com",
  messagingSenderId: "686072370000",
  appId: "1:686072370000:web:ac29d90a9724e7492f1255"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const PASSWORT = "Roses2025";

export default function App() {
  const [bearbeiten, setBearbeiten] = useState(false);
  const [eintraege, setEintraege] = useState([]);
  const [namensListe, setNamensListe] = useState([]);
  const [suche, setSuche] = useState("");
  const [neuerName, setNeuerName] = useState("");
  const [loeschName, setLoeschName] = useState("");

  useEffect(() => {
    async function ladeDaten() {
      const snap = await getDoc(doc(db, "belegungsplan", "daten"));
      if (snap.exists()) {
        setEintraege(snap.data().eintraege);
      }
      const namenSnap = await getDoc(doc(db, "belegungsplan", "namen"));
      if (namenSnap.exists()) {
        setNamensListe(namenSnap.data().liste);
      }
    }
    ladeDaten();
  }, []);

  const speichereDaten = async (daten) => {
    await setDoc(doc(db, "belegungsplan", "daten"), { eintraege: daten });
    setEintraege(daten);
  };

  const updateFeld = (index, feld, wert) => {
    if (feld !== "aufgestellt" && !bearbeiten) return;
    const neue = [...eintraege];
    neue[index][feld] = feld === "aufgestellt" ? wert : wert.trim();
    speichereDaten(neue);
  };

  const istGefuellt = (eintrag) => eintrag.name.trim() !== "";

  const gefiltert = eintraege.filter(e => {
    const text = `${e.gebaeude} ${e.gruppe} ${e.platz} ${e.name} ${e.staerke}`.toLowerCase();
    return text.includes(suche.toLowerCase());
  });

  const speichereNamen = async (liste) => {
    await setDoc(doc(db, "belegungsplan", "namen"), { liste });
    setNamensListe(liste);
  };

  const hinzufuegenName = () => {
    const name = neuerName.trim();
    if (name && !namensListe.includes(name)) {
      const neueListe = [...namensListe, name];
      speichereNamen(neueListe);
    }
    setNeuerName("");
  };

  const loescheName = () => {
    const name = loeschName.trim();
    if (name && namensListe.includes(name)) {
      const neueListe = namensListe.filter(n => n !== name);
      speichereNamen(neueListe);
    }
    setLoeschName("");
  };

  const aufgestelltStatus = (name) => {
    return eintraege.some(e => e.name === name && e.aufgestellt === true);
  };

  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Belagerungsaufstellung TSR</h1>

      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => {
            const eingabe = prompt("Passwort für Bearbeiten eingeben:");
            if (eingabe === PASSWORT) setBearbeiten(true);
            else alert("Falsches Passwort");
          }}
        >
          🔐 Bearbeiten aktivieren
        </button>
        <span><strong>Modus:</strong> {bearbeiten ? "Bearbeitung aktiv" : "Nur Lesen"}</span>
        <input
          type="text"
          placeholder="🔍 Suche..."
          className="p-2 border rounded flex-1"
          value={suche}
          onChange={(e) => setSuche(e.target.value)}
        />
      </div>

      {bearbeiten && (
        <div className="mb-6 flex flex-wrap gap-4">
          <div>
            <input
              type="text"
              placeholder="🆕 Name hinzufügen"
              value={neuerName}
              onChange={e => setNeuerName(e.target.value)}
              className="p-2 border mr-2"
            />
            <button onClick={hinzufuegenName} className="px-3 py-1 bg-green-600 text-white rounded">Hinzufügen</button>
          </div>
          <div>
            <input
              type="text"
              placeholder="❌ Name löschen"
              value={loeschName}
              onChange={e => setLoeschName(e.target.value)}
              className="p-2 border mr-2"
            />
            <button onClick={loescheName} className="px-3 py-1 bg-red-600 text-white rounded">Löschen</button>
          </div>
        </div>
      )}

      <div className="flex gap-10">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th>Gebäude</th>
              <th>Gruppe</th>
              <th>Platz</th>
              <th>Name</th>
              <th>Aufgestellt</th>
              <th>Stärke</th>
            </tr>
          </thead>
          
      <tbody>
        {eintraege.map((e, i) => {
          if (!gefiltert.includes(e)) return null;
          return (
            <tr key={i} className={istGefuellt(e) ? "bg-green-100" : "bg-red-100"}>
              <td>{e.gebaeude}</td>
              <td>{e.gruppe}</td>
              <td>{e.platz}</td>
              <td>
                <input
                  list="namen"
                  className="border p-1 w-full"
                  value={e.name}
                  disabled={!bearbeiten}
                  onChange={(ev) => updateFeld(i, "name", ev.target.value)}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={e.aufgestellt === true}
                  onChange={(ev) => updateFeld(i, "aufgestellt", ev.target.checked)}
                />
              </td>
              <td>
                <input
                  className="border p-1 w-full"
                  value={e.staerke}
                  disabled={!bearbeiten}
                  onChange={(ev) => updateFeld(i, "staerke", ev.target.value)}
                />
              </td>
            </tr>
          );
        })}
      </tbody>

        </table>

        {bearbeiten && (
          <div className="admin-liste">
            <h2 className="text-xl font-semibold mb-2">✅ Statusliste</h2>
            <ul>
              {namensListe.map((n, i) => (
                <li key={i} style={{ color: aufgestelltStatus(n) ? "green" : "red" }}>
                  {n}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <datalist id="namen">
        {namensListe.map((n, i) => (
          <option key={i} value={n} />
        ))}
      </datalist>
    </div>
  );
}
