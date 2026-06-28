import Header from "@/components/header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="">
        <section className="bg-[#e9f2f3] gap-8 px-6 pt-16 pb-24 flex flex-col justify-center">
          <span className="block mx-auto text-label-text bg-label-background py-2 px-4 rounded-full">
            Plataforma de Nueva Generación
          </span>
          <h1 className="font-bold leading-8.75 mx-auto text-[28px] max-w-78.5 text-center text-[#181C1D]">
            El estándar digital para
            las <span className="text-primary">contrataciones
              públicas</span> en el Perú.
          </h1>
          <p className="text-text-1 text-center">
            Automatizamos la validación de
            requisitos, reducimos el papeleo manual y
            eliminamos el riesgo de descalificación
            en tus procesos de licitación.
          </p>
          <div className="flex gap-4 flex-col">
            <button className="rounded-xl bg-primary text-white py-4 w-full">Registrar mi Empresa</button>
            <button className="rounded-xl border border-primary text-primary py-4 w-full">Demo para entidades</button>
          </div>
          <div className="bg-grey-4 w-full aspect-square rounded-3xl mx-auto">
            {/* Imagen del Hero */}
          </div>
        </section>
      </main>
    </>
  );
}
