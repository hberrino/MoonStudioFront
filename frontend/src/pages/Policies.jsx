const policies = [
  {
    number: "01",
    title: "Reservas",
    text: "El turno queda solicitado una vez completado el formulario y puede requerir la confirmación de la profesional. La reserva corresponde al servicio, fecha y horario seleccionados.",
  },
  {
    number: "02",
    title: "Puntualidad",
    text: "Contamos con una tolerancia de 15 minutos. Si transcurrido ese tiempo no recibimos comunicación o aviso del cliente, el turno podrá considerarse cancelado para cuidar la agenda de la profesional y de las siguientes reservas.",
  },
  {
    number: "03",
    title: "Cancelaciones",
    text: "En caso de no poder asistir, rogamos cancelar o reprogramar el turno con al menos 24 horas de anticipación. Esto nos permite reorganizar la agenda y ofrecer el horario a otra persona.",
  },
  {
    number: "04",
    title: "Señas",
    text: "Las señas solo serán requeridas en ocasiones especiales. Cuando corresponda, el estudio informará previamente el importe, el medio de pago y las condiciones aplicables.",
  },
  {
    number: "05",
    title: "Cambios de servicio",
    text: "Podés comunicarte con el estudio para solicitar modificaciones en tu turno. Los cambios estarán sujetos a la disponibilidad de la profesional y al tiempo necesario para realizar el nuevo servicio.",
  },
  {
    number: "06",
    title: "Precios",
    text: "Los precios informados son orientativos y pueden variar según el servicio finalmente realizado, su duración, complejidad o los productos necesarios. Cualquier diferencia será comunicada antes de comenzar.",
  },
  {
    number: "07",
    title: "Menores de edad",
    text: "Las personas menores de edad deberán contar con la autorización de una persona adulta responsable. Dependiendo del servicio, el estudio podrá solicitar también su acompañamiento.",
  },
  {
    number: "08",
    title: "Salud y resultados",
    text: "Antes del servicio, informanos sobre alergias, sensibilidades, lesiones, tratamientos o cualquier condición relevante. Los resultados pueden variar según el estado previo, las características personales y los cuidados posteriores recomendados.",
  },
];

export default function Policies() {
  return (
    <section className="policies-page">
      <header className="policies-hero" data-reveal>
        <p className="text-label uppercase text-tertiary">Moon Studio</p>
        <h1>Políticas del estudio</h1>
        <p>
          Estas pautas nos ayudan a cuidar cada turno, respetar el tiempo de quienes nos visitan y
          ofrecer una experiencia tranquila y organizada.
        </p>
      </header>

      <div className="policies-list">
        {policies.map((policy, index) => (
          <article
            className="policy-item"
            data-reveal
            data-reveal-delay={index % 2 === 1 ? "1" : undefined}
            key={policy.number}
          >
            <span aria-hidden="true">{policy.number}</span>
            <div>
              <h2>{policy.title}</h2>
              <p>{policy.text}</p>
            </div>
          </article>
        ))}
      </div>

      <footer className="policies-contact" data-reveal>
        <p className="text-label uppercase text-tertiary">¿Tenés alguna duda?</p>
        <h2>Estamos para ayudarte</h2>
        <p>Podés comunicarte con el estudio antes de reservar o modificar un turno existente.</p>
        <a href="https://www.instagram.com/moonstudio.ok/" rel="noreferrer" target="_blank">
          Contactar al estudio
        </a>
      </footer>
    </section>
  );
}
