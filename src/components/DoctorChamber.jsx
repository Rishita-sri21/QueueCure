import React from "react";
import { Stethoscope } from "lucide-react";

export default function DoctorChamber({
  currentlyServing
}) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Stethoscope className="w-6 h-6 text-cyan-400" />
        <h2 className="text-xl font-bold text-cyan-400">
          Doctor Chamber
        </h2>
      </div>

      {currentlyServing ? (
        <div className="space-y-4">
          <div className="bg-slate-900 p-5 rounded-xl">
            <p className="text-slate-500 text-sm">
              Current Patient
            </p>

            <h3 className="text-4xl font-black text-cyan-400">
              #{currentlyServing.token}
            </h3>

            <p className="text-xl text-white">
              {currentlyServing.name}
            </p>

            <p className="text-slate-400">
              {currentlyServing.severity}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-slate-500">
          No patient currently being served
        </div>
      )}
    </div>
  );
}