import { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import data from './data';

function tirar4d6() {
  const dados = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  dados.sort((a, b) => b - a);
  return dados.slice(0, 3).reduce((a, b) => a + b, 0);
}

function mod(score) {
  return Math.floor((score - 10) / 2);
}

function App() {
  const [form, setForm] = useState({
    nombre: '', raza: '', clase: '',
    fuerza: 10, destreza: 10, constitucion: 10,
    inteligencia: 10, sabiduria: 10, carisma: 10
  });

  const [habilidades, setHabilidades] = useState([]);
  const [dotes, setDotes] = useState([]);
  const [personajes, setPersonajes] = useState([]);

  useEffect(() => {
    if (form.clase) {
      setHabilidades(data.habilidades[form.clase] || []);
      setDotes(data.dotes[form.clase] || []);
    }
  }, [form.clase]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('fichas')) || [];
    setPersonajes(saved);
  }, []);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const lanzar = () => {
    setForm(f => ({
      ...f,
      fuerza: tirar4d6(),
      destreza: tirar4d6(),
      constitucion: tirar4d6(),
      inteligencia: tirar4d6(),
      sabiduria: tirar4d6(),
      carisma: tirar4d6()
    }));
  };

  const guardar = () => {
    const nuevos = [...personajes, form];
    localStorage.setItem('fichas', JSON.stringify(nuevos));
    setPersonajes(nuevos);
  };

  const cargar = (p) => setForm(p);

  const borrar = (nombre) => {
    const filtrado = personajes.filter(p => p.nombre !== nombre);
    localStorage.setItem('fichas', JSON.stringify(filtrado));
    setPersonajes(filtrado);
  };

  const exportar = () => {
    const element = document.getElementById("resultado-ficha");
    html2pdf().from(element).save(`${form.nombre}_ficha.pdf`);
  };

  return (
    <div className="p-4 text-white bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-center">Ficha de Personaje - Conan</h1>
      <div className="max-w-3xl mx-auto grid gap-4">
        <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handle} className="text-black p-2 rounded" />
        <select name="raza" onChange={handle} value={form.raza} className="text-black p-2 rounded">
          <option value="">-- Raza --</option>
          {data.razas.map(r => <option key={r}>{r}</option>)}
        </select>
        <select name="clase" onChange={handle} value={form.clase} className="text-black p-2 rounded">
          <option value="">-- Clase --</option>
          {data.clases.map(c => <option key={c}>{c}</option>)}
        </select>
        <button onClick={lanzar} className="bg-red-600 hover:bg-red-700 p-2 rounded">Lanzar Atributos</button>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {["fuerza","destreza","constitucion","inteligencia","sabiduria","carisma"].map(attr => (
            <input key={attr} name={attr} type="number" value={form[attr]} onChange={handle}
              className="p-2 text-black rounded" placeholder={attr.toUpperCase()} />
          ))}
        </div>

        <div id="resultado-ficha" className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-bold">{form.nombre}</h2>
          <p><strong>Raza:</strong> {form.raza} | <strong>Clase:</strong> {form.clase}</p>
          <ul className="list-disc pl-4">
            {["fuerza","destreza","constitucion","inteligencia","sabiduria","carisma"].map(attr => (
              <li key={attr}>
                {attr.toUpperCase()}: {form[attr]} ({mod(form[attr]) >= 0 ? '+' : ''}{mod(form[attr])})
              </li>
            ))}
          </ul>
          <p className="mt-2"><strong>Habilidades:</strong> {habilidades.join(', ')}</p>
          <p><strong>Dotes:</strong> {dotes.join(', ')}</p>
        </div>

        <button onClick={guardar} className="bg-green-600 hover:bg-green-700 p-2 rounded">Guardar Ficha</button>
        <button onClick={exportar} className="bg-blue-600 hover:bg-blue-700 p-2 rounded">Exportar a PDF</button>

        <div className="mt-4">
          <h3 className="font-bold text-lg">Fichas Guardadas</h3>
          {personajes.map(p => (
            <div key={p.nombre} className="flex justify-between bg-gray-700 p-2 mt-2 rounded">
              <span>{p.nombre}</span>
              <div>
                <button onClick={() => cargar(p)} className="bg-yellow-500 text-black px-2 rounded mr-2">Cargar</button>
                <button onClick={() => borrar(p.nombre)} className="bg-red-500 text-black px-2 rounded">Borrar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;