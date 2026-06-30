import Header from "@/components/header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="">
        {/* Section: Hero */}
        <section className="bg-[#e9f2f3]">
          <div className="md:mx-auto md:max-w-7xl px-6 pt-16 pb-24 gap-16 flex flex-col md:flex-row justify-center md:justify-between">
            {/* Contenedor del lado izquierdo/arriba */}
            <div className="space-y-8">
              <span className="flex items-center gap-2 mx-auto md:mx-0 text-label-text bg-label-background py-2 px-4 rounded-full font-semibold w-fit">
                <FeatureIcon height={18} fill="#5c6675" /> Plataforma de Nueva Generación
              </span>
              <h1 className="font-bold leading-8.75 md:leading-13 mx-auto md:mx-0 text-[28px] md:text-[44px] max-w-78.5 md:max-w-xl text-center md:text-left text-[#181C1D]">
                El estándar digital para
                las <span className="text-primary">contrataciones
                  públicas</span> en el Perú.
              </h1>
              <p className="text-text-1 text-center md:text-xl md:text-left md:max-w-xl">
                Automatizamos la validación de
                requisitos, reducimos el papeleo manual y
                eliminamos el riesgo de descalificación
                en tus procesos de licitación.
              </p>
              <div className="flex gap-4 flex-col md:max-w-xl md:mx-0 md:flex-row">
                <button className="rounded-xl bg-primary text-white py-4 w-full font-bold">Registrar mi Empresa</button>
                <button className="rounded-xl border border-primary text-primary py-4 w-full font-bold">Demo para entidades</button>
              </div>
            </div>
            {/* Contenedor del lado derecho/abajo */}
            <div className="bg-grey-4 w-full aspect-square rounded-3xl mx-auto md:mx-0 max-w-125">
              {/* Imagen del Hero */}
            </div>
          </div>
        </section>
        { /* Section: Transparencia y Eficiencia */}
        <section className="bg-background py-24 space-y-4 px-6">
          <h2 className="text-[28px] font-semibold text-center max-w-56 mx-auto">
            Transparencia y Eficiencia
          </h2>
          <p className="text-text-1 text-center">
            Diseñado para modernizar cada etapa del
            proceso de contratación, desde la
            convocatoria hasta la adjudicación final.
          </p>
          <div className="grid grid-cols-1 gap-8">
            <article className="w-full p-8 rounded-xl border border-grey-2">
              <div className="space-y-4">
                <div className="size-14 flex items-center mx-auto justify-center rounded-lg bg-primary">
                  <img src="/Icon/Security.svg" alt="Icono Security" />
                </div>
                <h3 className="text-xl font-semibold max-w-60 mx-auto text-center">Postula con Confianza y Cero Errores</h3>
                <p className="text-text-1">
                  Diseñado específicamente para proveedores del estado, garantizando
                  el cumplimiento estricto de las bases integradas para evitar
                  descalificaciones innecesarias.
                </p>
                <ul className="grid grid-cols-2 gap-6 pt-4 border-t border-grey-2">
                  <li className="space-y-2">
                    <img src="/Icon/Alert.svg" alt="Icon alert" className="size-4" />
                    <h4 className="text-sm font-semibold">Alertas de Descalificación</h4>
                    <p className="text-xs">Detección temprana de inconsistencias
                      antes de enviar tu propuesta.</p>
                  </li>
                  <li className="space-y-2">
                    <img src="/Icon/Stars.svg" alt="Icon alert" className="size-4" />
                    <h4 className="text-sm font-semibold">Generación Automatizada</h4>
                    <p className="text-xs">Creación instantánea de Anexos 1, 2 y 3 con
                      datos verificados.</p>
                  </li>
                </ul>
              </div>
            </article>
            <article className="w-full p-8 rounded-xl border border-grey-2">
              <div className="space-y-4">
                <div className="size-14 flex items-center mx-auto justify-center rounded-lg bg-primary">
                  <img src="/Icon/Audit.svg" alt="Icono Auditoria" />
                </div>
                <h3 className="text-xl font-semibold max-w-60 mx-auto text-center">Auditoría Transparente en Segundos</h3>
                <p className="text-text-1">
                  Herramientas robustas para comités de selección, asegurando
                  procesos limpios, auditables y con un motor de reglas digitalizado de
                  alta precisión.
                </p>
                <ul className="grid grid-cols-2 gap-6 pt-4 border-t border-grey-2">
                  <li className="space-y-2">
                    <img src="/Icon/Form.svg" alt="Icono formulario" className="size-4" />
                    <h4 className="text-sm font-semibold">Diseñador de Formularios</h4>
                    <p className="text-xs">
                      Estructura requerimientos técnicos de forma
                      estandarizada.</p>
                  </li>
                  <li className="space-y-2">
                    <img src="/Icon/Rules.svg" alt="Icono reglas digitales" className="size-4" />
                    <h4 className="text-sm font-semibold">Motor de Reglas Digital</h4>
                    <p className="text-xs">Clasificación automática de postores en "Aptos" u "Observados".</p>
                  </li>
                </ul>
              </div>
            </article>
          </div>
        </section>
        {/* Section: Metricas */}
        <section className="bg-primary py-10 px-6">
          <ul className="grid grid-cols-1 gap-12 text-center text-white">
            <li className="max-w-50 mx-auto space-y-2">
              <p className="text-4xl font-bold">45%</p>
              <p className="text-white font-medium">
                de postores descalificados por errores formales
                manuales.
              </p>
            </li>
            <li className="max-w-50 mx-auto space-y-2">
              <p className="text-4xl font-bold">15 Días</p>
              <p className="text-white font-medium">
                reducidos a minutos para
                revisión de expedientes.
              </p>
            </li>
            <li className="max-w-50 mx-auto space-y-2">
              <p className="text-4xl font-bold">S/. 0</p>
              <p className="text-white font-medium">
                pérdidas estimadas por
                procesos declarados
                desiertos.
              </p>
            </li>
          </ul>
        </section>
        {/* Section: Precios */}
        <section className="py-24 px-6 bg-background-2">
          <div className="space-y-4 mb-16">
            <h2 className="text-[28px] font-semibold text-center mx-auto leading-9.5">
              Planes diseñados para
              la transparencia
            </h2>
            <p className="text-text-1 text-center">
              Escoge la herramienta que mejor se adapte a
              tu rol en la contratación pública.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8">
            <article className="p-8 bg-background rounded-3xl space-y-8">
              <div className="space-y-1">
                <h3 className="text-xl text-primary font-semibold leading-8">Plan Proveedor</h3>
                <p>
                  Para empresas que postulan al estado.
                </p>
              </div>
              <p className="text-4xl font-bold text-primary">
                S/. 149 <span className="text-sm font-normal text-text-1">/ mes</span>
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <FeatureIcon height={18} />Buscador inteligente de convocatorias
                </li>
                <li className="flex items-center gap-3">
                  <FeatureIcon height={18} />Simulador de cumplimiento de bases
                </li>
                <li className="flex items-center gap-3">
                  <FeatureIcon height={18} />Autocompletado de Anexos técnicos
                </li>
              </ul>
              <button className="rounded-xl bg-primary text-white py-4 w-full">
                Comenzar Prueba
              </button>
            </article>
            <article className="p-8 bg-primary rounded-3xl space-y-8 relative overflow-hidden">
              <span className="bg-white text-primary w-40 py-1 text-[8px] absolute text-center -right-10 top-10 rotate-45 font-bold">RECOMENDADO</span>
              <div className="space-y-1">
                <h3 className="text-xl text-white font-semibold leading-8">Plan Institucional</h3>
                <p className="text-white">
                  Para entidades públicas y comités.
                </p>
              </div>
              <p className="text-2xl font-bold text-white text-center">
                Cotización Institucional
              </p>
              <ul className="space-y-4 text-white">
                <li className="flex items-center gap-3">
                  <FeatureIcon fill="white" height={18} />Licencias para Comités de Selección
                </li>
                <li className="flex items-center gap-3">
                  <FeatureIcon fill="white" height={18} />Creador de Requerimientos Estandarizados
                </li>
                <li className="flex items-center gap-3">
                  <FeatureIcon fill="white" height={18} />Soporte técnico prioritario 24/7
                </li>
              </ul>
              <button className="rounded-xl border border-white text-white py-4 w-full">
                Comenzar Prueba
              </button>
            </article>
          </div>
        </section>
      </main>
      <footer className="p-6 bg-background-2 w-full shadow-[0_4px_16px_rgba(0,0,0,0.15)]">
        <ul className="flex gap-4 w-fit mx-auto text-center text-sm text-text-1">
          <li>Términos y Condiciones</li>
          <li>Privacidad</li>
          <li>Ayuda</li>
        </ul>
        <small className="block mx-auto text-center mt-2 max-w-50 font-medium text-text-1">
          © <time dateTime="2026">2026</time> Lictia. Todos los derechos reservados.
        </small>
      </footer>
    </>
  );
}

const FeatureIcon = ({ fill = "#006872", height = 24 }: { fill?: string, height?: number }) => (
  <svg height={height} viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.63636 24L6.47727 20.3429L2.38636 19.4286L2.78409 15.2L0 12L2.78409 8.8L2.38636 4.57143L6.47727 3.65714L8.63636 0L12.5 1.65714L16.3636 0L18.5227 3.65714L22.6136 4.57143L22.2159 8.8L25 12L22.2159 15.2L22.6136 19.4286L18.5227 20.3429L16.3636 24L12.5 22.3429L8.63636 24V24M9.60227 21.0857L12.5 19.8286L15.4545 21.0857L17.0455 18.3429L20.1705 17.6L19.8864 14.4L21.9886 12L19.8864 9.54286L20.1705 6.34286L17.0455 5.65714L15.3977 2.91429L12.5 4.17143L9.54545 2.91429L7.95455 5.65714L4.82955 6.34286L5.11364 9.54286L3.01136 12L5.11364 14.4L4.82955 17.6571L7.95455 18.3429L9.60227 21.0857V21.0857M12.5 12V12V12V12V12V12V12V12V12V12V12V12V12V12V12V12V12V12V12V12V12V12M11.3068 16.0571L17.7273 9.6L16.1364 7.94286L11.3068 12.8L8.86364 10.4L7.27273 12L11.3068 16.0571V16.0571" fill={fill} />
  </svg>
)