"use client";

import React from "react";

export function SearchBar() {
  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-30">
      <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-4 items-center">
        {/* Campo de búsqueda */}
        <div className="flex-1 w-full relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
          <input
            className="w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 qph-body-md text-on-surface focus:outline-none"
            placeholder="¿Qué quieres vivir hoy?"
            type="text"
          />
        </div>

        {/* Separador */}
        <div className="h-10 w-px bg-outline-variant/30 hidden md:block"></div>

        {/* Filtros */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Categoría */}
          <div className="flex-1 md:w-40 px-4 py-2 flex flex-col">
            <span className="text-[10px] qph-label-bold uppercase text-outline">
              Categoría
            </span>
            <select className="bg-transparent border-none p-0 focus:ring-0 qph-label-bold cursor-pointer text-on-surface focus:outline-none">
              <option>Todos</option>
              <option>Conciertos</option>
              <option>Deportes</option>
              <option>Teatro</option>
            </select>
          </div>

          {/* Ubicación */}
          <div className="flex-1 md:w-40 px-4 py-2 flex flex-col">
            <span className="text-[10px] qph-label-bold uppercase text-outline">
              Ubicación
            </span>
            <select className="bg-transparent border-none p-0 focus:ring-0 qph-label-bold cursor-pointer text-on-surface focus:outline-none">
              <option>Madrid</option>
              <option>Barcelona</option>
              <option>Valencia</option>
            </select>
          </div>
        </div>

        {/* Botón Buscar */}
        <button className="w-full md:w-auto px-8 py-4 bg-electric-indigo text-white rounded-xl qph-label-bold hover:bg-primary transition-all duration-200 cursor-pointer active:scale-98">
          Buscar
        </button>
      </div>
    </div>
  );
}
