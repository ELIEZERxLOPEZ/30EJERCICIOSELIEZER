import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Play, RotateCcw, Terminal, Lightbulb } from "lucide-react";

const textField = (label) => ({ label, text: true });
const list = (text, label = "Números separados por comas") => {
  const values = text.split(",").map((v) => Number(v.trim()));
  if (!text.trim() || values.some((v) => !Number.isFinite(v))) {
    throw Error(`Introduce valores válidos: ${label.toLowerCase()}.`);
  }
  return values;
};

const exercises = {
  1: {
    title: "💼 Salario del trabajador",
    description: "Calcula el salario incluyendo las horas extras.",
    prompt: "Si trabaja más de 40 horas, las horas extras se pagan con un aumento del 50%.",
    fields: ["Horas trabajadas", "Tarifa por hora"],
    calculate: ([h, t]) => {
      if (h < 0 || t < 0) throw Error("Los valores no pueden ser negativos.");
      const normal = Math.min(h, 40), extra = Math.max(h - 40, 0);
      return { "Horas normales": normal, "Horas extras": extra, "Salario normal": (normal*t).toFixed(2), "Pago de horas extras": (extra*t*1.5).toFixed(2), "SALARIO TOTAL": (normal*t+extra*t*1.5).toFixed(2) };
    }
  },
  2: {
    title: "💰 Descuento del sueldo",
    description: "Calcula el descuento y el sueldo neto.",
    prompt: "10% hasta 1000, 5% del adicional hasta 2000 y 3% del excedente.",
    fields: ["Sueldo del trabajador"],
    calculate: ([s]) => {
      if (s < 0) throw Error("El sueldo no puede ser negativo.");
      const d = s <= 1000 ? s*.10 : s <= 2000 ? 100+(s-1000)*.05 : 150+(s-2000)*.03;
      return { "Sueldo original": s.toFixed(2), Descuento: d.toFixed(2), "SUELDO NETO": (s-d).toFixed(2) };
    }
  },
  3: {
    title: "🏷️ Descuento de un monto",
    description: "Calcula el descuento aplicado a una cantidad.",
    prompt: "El enunciado indica 10% por encima de 100 y 2% en el otro tramo; el código del PDF utiliza 20% para el segundo tramo.",
    fields: ["Monto"],
    calculate: ([m]) => {
      if (m < 0) throw Error("El monto no puede ser negativo.");
      const d = m > 100 ? m*.10 : m*.20;
      return { Monto: m.toFixed(2), "Descuento aplicado (según código PDF)": d.toFixed(2), "Monto final": (m-d).toFixed(2) };
    }
  },
  4: {
    title: "⏱️ Conversión de segundos",
    description: "Calcula los minutos y segundos restantes.",
    prompt: "Dado un tiempo en segundos, calcula los segundos que faltan para completar el minuto actual.",
    fields: ["Tiempo en segundos"],
    calculate: ([s]) => {
      if (!Number.isInteger(s) || s < 0) throw Error("Introduce segundos enteros no negativos.");
      return { "Minutos completos": Math.floor(s/60), "Segundos restantes del minuto": s%60 === 0 ? 0 : 60-s%60 };
    }
  },
  5: {
    title: "📅 Conversión de minutos",
    description: "Convierte minutos en días, horas y minutos.",
    prompt: "Dado un tiempo en minutos, calcula los días, horas y minutos correspondientes.",
    fields: ["Tiempo en minutos"],
    calculate: ([m]) => {
      if (!Number.isInteger(m) || m < 0) throw Error("Introduce minutos enteros no negativos.");
      return { Días: Math.floor(m/1440), Horas: Math.floor(m%1440/60), Minutos: m%60 };
    }
  },
  6: {
    title: "➕ Suma de números naturales",
    description: "Suma los primeros N números naturales.",
    prompt: "Calcular mediante un algoritmo repetitivo la suma de los N primeros números naturales.",
    fields: ["Número N"],
    calculate: ([n]) => {
      if (!Number.isInteger(n) || n < 0 || n > 100000) throw Error("Introduce un entero entre 0 y 100000.");
      return { Serie: n ? `1 + 2 + ... + ${n}` : "Serie vacía", "SUMA TOTAL": n*(n+1)/2 };
    }
  },
  7: {
    title: "👷 Suma de salarios",
    description: "Calcula la suma de los salarios de varios trabajadores.",
    prompt: "Modificar el ejercicio 1 para obtener la suma de los salarios de todos los trabajadores.",
    fields: [textField("Horas trabajadas por cada trabajador (separadas por comas)"), textField("Tarifas por hora (separadas por comas)")],
    calculate: ([hoursText, ratesText]) => {
      const h = list(hoursText, "horas"), r = list(ratesText, "tarifas");
      if (h.length !== r.length || h.some(x=>x<0) || r.some(x=>x<0)) throw Error("Introduce la misma cantidad de horas y tarifas no negativas.");
      const salaries = h.map((x,i)=>x*r[i]);
      return { "Cantidad de trabajadores": h.length, "Salarios individuales": salaries.map((x,i)=>`Trabajador ${i+1}: ${x.toFixed(2)}`).join(" | "), "SUMA TOTAL": salaries.reduce((a,b)=>a+b,0).toFixed(2) };
    }
  },
  8: {
    title: "💵 Salario por horas",
    description: "Calcula el salario de una persona.",
    prompt: "Dadas las horas trabajadas y la tarifa de pago, calcular el salario.",
    fields: ["Horas trabajadas", "Tarifa por hora"],
    calculate: ([h,t]) => {
      if (h<0 || t<0) throw Error("Los valores no pueden ser negativos.");
      return { Horas: h, Tarifa: t.toFixed(2), SALARIO: (h*t).toFixed(2) };
    }
  },
  9: {
    title: "📚 Estadísticas de notas",
    description: "Cuenta notas aprobadas y desaprobadas y calcula promedios.",
    prompt: "Dadas N notas, contar desaprobadas (≤10.5), aprobadas (>10.5 y <20), promedio general y promedios por grupo.",
    fields: [textField("Notas separadas por comas")],
    calculate: ([raw]) => {
      const a=list(raw,"notas");
      if(a.some(x=>x<0 || x>=20)) throw Error("Las notas deben estar entre 0 y menos de 20.");
      const fail=a.filter(x=>x<=10.5), pass=a.filter(x=>x>10.5);
      const avg=x=>x.length?(x.reduce((s,n)=>s+n,0)/x.length).toFixed(2):"No hay notas";
      return { "Cantidad de notas":a.length, Desaprobadas:fail.length, Aprobadas:pass.length, "Promedio general":avg(a), "Promedio aprobadas":avg(pass), "Promedio desaprobadas":avg(fail) };
    }
  },
  10: {
    title: "🔢 Suma de los dígitos",
    description: "Suma todos los dígitos de un número.",
    prompt: "Dado un número, determinar la suma de sus dígitos.",
    fields: ["Número entero"],
    calculate: ([n]) => {
      if(!Number.isInteger(n)) throw Error("Introduce un número entero.");
      const digits=String(Math.abs(n)).split("").map(Number);
      return { Número:n, Dígitos:digits.join(" + "), "SUMA DE DÍGITOS":digits.reduce((a,b)=>a+b,0) };
    }
  },
  11: {
    title: "🧾 Factura con IVA",
    description: "Calcula una factura con impuesto y descuento.",
    prompt: "IVA del 15%; si el precio bruto es mayor o igual a 50, aplicar descuento del 5% (el código fuente usa ≥50).",
    fields: ["Precio por artículo", "Cantidad de artículos"],
    calculate: ([p,n]) => {
      if(p<0 || !Number.isInteger(n) || n<=0) throw Error("Introduce un precio no negativo y una cantidad entera positiva.");
      const venta=p*n, iva=venta*.15, bruto=venta+iva, d=bruto>=50?bruto*.05:0;
      return { "Precio de venta":venta.toFixed(2), "IVA (15%)":iva.toFixed(2), "Precio bruto":bruto.toFixed(2), Descuento:d.toFixed(2), "TOTAL A PAGAR":(bruto-d).toFixed(2) };
    }
  },
  12: {
    title: "🔢 Clasificación de números",
    description: "Cuenta números pares, impares, positivos y negativos.",
    prompt: "Introducir 50 números y determinar cuántos son pares, impares, positivos y negativos. El código del PDF cuenta el cero como negativo.",
    fields: [textField("Introduce 50 números enteros separados por comas")],
    calculate: ([raw]) => {
      const a=list(raw,"números");
      if(a.length!==50 || a.some(x=>!Number.isInteger(x))) throw Error("Debes introducir exactamente 50 números enteros.");
      return { Pares:a.filter(x=>x%2===0).length, Impares:a.filter(x=>x%2!==0).length, Positivos:a.filter(x=>x>0).length, "Negativos (incluye cero, según código PDF)":a.filter(x=>x<=0).length };
    }
  },
  13: {
    title: "✖️ Factorial",
    description: "Calcula el factorial de un número.",
    prompt: "Desarrollar un algoritmo para calcular e imprimir el factorial de un número.",
    fields: ["Número entero"],
    calculate: ([n]) => {
      if(!Number.isInteger(n)||n<0||n>170) throw Error("Introduce un entero entre 0 y 170.");
      let f=1; for(let i=1;i<=n;i++) f*=i;
      return { Número:n, "FACTORIAL":f.toLocaleString("es-ES") };
    }
  },
  14: {
    title: "📊 Media de 100 números",
    description: "Calcula la media de cien números.",
    prompt: "Introducir 100 números y calcular su media.",
    fields: [textField("Introduce exactamente 100 números separados por comas")],
    calculate: ([raw]) => {
      const a=list(raw,"números");
      if(a.length!==100) throw Error("Debes introducir exactamente 100 números.");
      const s=a.reduce((x,y)=>x+y,0);
      return { "Cantidad de números":100, "Suma total":s.toFixed(2), MEDIA:(s/100).toFixed(2) };
    }
  },
  15: {
    title: "🔁 Suma y producto de pares",
    description: "Calcula la suma y el producto de los números pares.",
    prompt: "Calcular la suma y el producto de los números pares entre 20 y 400, inclusive.",
    fields: [],
    calculate: () => {
      let sum=0, product=1n;
      for(let i=20;i<=400;i+=2){sum+=i;product*=BigInt(i);}
      return { Rango:"20 a 400", Suma:sum, Producto:product.toString() };
    }
  },
  18: {
    title: "🔤 Primera vocal",
    description: "Encuentra la primera vocal introducida.",
    prompt: "Leer caracteres uno a uno hasta encontrar una vocal.",
    fields: ["Carácter"],
    calculate: ([c]) => {
      const v=String(c).toLowerCase();
      if(!["a","e","i","o","u"].includes(v)) throw Error("El carácter debe ser una vocal.");
      return { "Primera vocal":v.toUpperCase(), Resultado:"¡Vocal encontrada!" };
    }
  },
  19: {
    title: "🔍 Parte fraccionaria",
    description: "Determina si un número tiene parte fraccionaria.",
    prompt: "Ingresar un número y determinar si tiene o no parte fraccionaria.",
    fields: ["Número"],
    calculate: ([n]) => ({ Número:n, Resultado:Number.isInteger(n)?"No tiene parte fraccionaria":"Tiene parte fraccionaria" })
  },
  20: {
    title: "📐 Ecuación cuadrática",
    description: "Calcula soluciones reales o imaginarias.",
    prompt: "Resolver ax² + bx + c = 0, incluyendo soluciones imaginarias.",
    fields: ["Coeficiente a","Coeficiente b","Coeficiente c"],
    calculate: ([a,b,c]) => {
      if(a===0) throw Error("El coeficiente a debe ser diferente de cero.");
      const d=b*b-4*a*c, real=-b/(2*a);
      if(d>0) return { Discriminante:d, "Solución x1":((-b+Math.sqrt(d))/(2*a)).toFixed(3), "Solución x2":((-b-Math.sqrt(d))/(2*a)).toFixed(3) };
      if(d===0) return { Discriminante:d, "Solución única":real.toFixed(3) };
      const im=Math.sqrt(-d)/(2*Math.abs(a));
      return { Discriminante:d, "Solución x1":`${real.toFixed(3)} + ${im.toFixed(3)}i`, "Solución x2":`${real.toFixed(3)} - ${im.toFixed(3)}i` };
    }
  },
  21: {
    title: "🔄 Cuatro operaciones (10 procesos)",
    description: "Realiza suma, resta, multiplicación y división diez veces.",
    prompt: "Ingresar dos números y calcular las cuatro operaciones. El proceso termina después de 10 procesos.",
    fields: [textField("Pares de números separados por punto y coma (ejemplo: 8,2; 10,5; 7,1)")],
    calculate: ([raw]) => {
      const pairs=raw.split(";").map(x=>x.split(",").map(Number));
      if(pairs.length!==10 || pairs.some(p=>p.length!==2 || p.some(x=>!Number.isFinite(x)))) throw Error("Introduce exactamente 10 pares en formato a,b separados por punto y coma.");
      return Object.fromEntries(pairs.map(([a,b],i)=>[`Proceso ${i+1}`,`Suma ${a+b}; resta ${a-b}; multiplicación ${a*b}; división ${b===0?"indefinida":(a/b).toFixed(2)}`]));
    }
  },
  22: {
    title: "🧮 Cubo y raíz cuadrada",
    description: "Calcula el cubo y la raíz cuadrada de números sucesivos.",
    prompt: "Introducir números y calcular cubo y raíz cuadrada. Termina al ingresar 0.",
    fields: [textField("Números separados por comas; termina con 0")],
    calculate: ([raw]) => {
      const a=list(raw,"números"), out=[];
      for(const n of a){if(n===0)break;out.push(`${n}: cubo ${n**3}; raíz ${n<0?"no real":Math.sqrt(n).toFixed(2)}`);}
      return { Resultados:out.join(" | ")||"No se procesaron números." };
    }
  },
  23: {
    title: "🔁 Operaciones hasta ingresar cero",
    description: "Repite las cuatro operaciones hasta que el primer número sea cero.",
    prompt: "Ingresar dos números y calcular suma, diferencia, producto y división. Termina cuando el primer número sea 0.",
    fields: [textField("Pares a,b separados por punto y coma; usa 0 como primer número para terminar")],
    calculate: ([raw]) => {
      const pairs=raw.split(";").map(x=>x.split(",").map(Number)), out=[];
      for(const p of pairs){if(p.length!==2||p.some(x=>!Number.isFinite(x)))throw Error("Formato inválido. Usa a,b; c,d; 0,0.");if(p[0]===0)break;const [a,b]=p;out.push(`(${a},${b}) suma ${a+b}, resta ${a-b}, producto ${a*b}, división ${b===0?"indefinida":(a/b).toFixed(2)}`);}
      return { Procesos:out.join(" | ")||"No se realizaron operaciones." };
    }
  },
  24: {
    title: "📏 Área de un triángulo",
    description: "Calcula el área conociendo sus tres lados.",
    prompt: "Ingresar los tres lados y calcular el área del triángulo mediante la fórmula de Herón.",
    fields: ["Lado A","Lado B","Lado C"],
    calculate: ([a,b,c]) => {
      if(a<=0||b<=0||c<=0||a+b<=c||a+c<=b||b+c<=a) throw Error("Los lados no forman un triángulo válido.");
      const s=(a+b+c)/2, area=Math.sqrt(s*(s-a)*(s-b)*(s-c));
      return { Semiperímetro:s.toFixed(2), "ÁREA":area.toFixed(2) };
    }
  },
  25: {
    title: "📐 Hipotenusa",
    description: "Calcula la hipotenusa con el teorema de Pitágoras.",
    prompt: "Ingresar los dos catetos de un triángulo rectángulo y calcular la hipotenusa.",
    fields: ["Primer cateto","Segundo cateto"],
    calculate: ([a,b]) => {
      if(a<=0||b<=0) throw Error("Los catetos deben ser positivos.");
      return { "Cateto A":a, "Cateto B":b, HIPOTENUSA:Math.hypot(a,b).toFixed(2) };
    }
  },
  26: {
    title: "⭕ Círculo y esfera",
    description: "Calcula longitud, área del círculo y volumen de la esfera.",
    prompt: "Ingresar un radio y calcular longitud de circunferencia, área del círculo y volumen de la esfera.",
    fields: ["Radio"],
    calculate: ([r]) => {
      if(r<0) throw Error("El radio no puede ser negativo.");
      const pi=3.14;
      return { Radio:r, "Longitud de circunferencia":(2*pi*r).toFixed(2), "Área del círculo":(pi*r*r).toFixed(2), "Volumen de esfera":((4/3)*pi*r**3).toFixed(2) };
    }
  },
  27: {
    title: "🍽️ Consumos del restaurante",
    description: "Calcula el total de 130 consumos con descuentos.",
    prompt: "Leer 130 consumos. Si un consumo excede $130, aplicar 15% de descuento y sumar todos los pagos.",
    fields: [textField("Introduce los 130 consumos separados por comas")],
    calculate: ([raw]) => {
      const a=list(raw,"consumos");
      if(a.length!==130||a.some(x=>x<0)) throw Error("Introduce exactamente 130 consumos no negativos.");
      const paid=a.map(x=>x>130?x*.85:x);
      return { "Consumos registrados":130, "Descuentos aplicados":a.filter(x=>x>130).length, "TOTAL PAGADO":paid.reduce((x,y)=>x+y,0).toFixed(2) };
    }
  },
  28: {
    title: "➕ Suma desde el número 8",
    description: "Suma los enteros desde 8 hasta N.",
    prompt: "Calcular S = 8 + 9 + 10 + ... + N.",
    fields: ["Número N"],
    calculate: ([n]) => {
      if(!Number.isInteger(n)||n<8) throw Error("El número debe ser un entero mayor o igual a 8.");
      let s=0;for(let i=8;i<=n;i++)s+=i;
      return { Serie:`8 + 9 + ... + ${n}`, SUMA:s };
    }
  },
  29: {
    title: "💵 Control de caja",
    description: "Calcula egresos y saldo restante en caja.",
    prompt: "La caja comienza con $371. Introducir egresos hasta escribir -1; el -1 es solo señal de fin y no se suma.",
    fields: [textField("Egresos separados por comas; termina con -1")],
    calculate: ([raw]) => {
      const a=list(raw,"egresos"), stop=a.indexOf(-1), expenses=stop>=0?a.slice(0,stop):a;
      if(expenses.some(x=>x<0)) throw Error("Los egresos deben ser positivos; -1 solo termina el proceso.");
      const total=expenses.reduce((x,y)=>x+y,0);
      return { "Total de egresos":total.toFixed(2), "Saldo en caja":(371-total).toFixed(2), "Estado":total>371?"La caja queda en déficit":"Saldo calculado" };
    }
  },
  30: {
    title: "📝 Promedio de dos notas",
    description: "Calcula el promedio y determina si está aprobado.",
    prompt: "Ingresar dos notas en escala de 0 a 20, calcular promedio y mostrar aprobado o desaprobado. Aprobación desde 10.5.",
    fields: ["Primera nota","Segunda nota"],
    calculate: ([a,b]) => {
      if(a<0||a>20||b<0||b>20) throw Error("Las notas deben estar entre 0 y 20.");
      const avg=(a+b)/2;
      return { "Promedio":avg.toFixed(2), Resultado:avg>=10.5?"APROBADO":"DESAPROBADO" };
    }
  },
  31: {
    title: "🏅 Clasificación por deporte",
    description: "Cuenta personas según el deporte que practican.",
    prompt: "Clasificar personas en ajedrez, fútbol, vóley y básquet. El enunciado indica 400 personas; el código del PDF muestra 10 iteraciones.",
    fields: [textField("Deportes separados por comas (ajedrez, futbol, voley, basquet)")],
    calculate: ([raw]) => {
      const a=raw.split(",").map(x=>x.trim().toLowerCase());
      const valid=["ajedrez","futbol","fútbol","voley","vóley","basquet","básquet"];
      if(a.some(x=>!valid.includes(x))) throw Error("Usa ajedrez, futbol, voley o basquet.");
      return { "Personas registradas":a.length, Ajedrez:a.filter(x=>x==="ajedrez").length, Fútbol:a.filter(x=>x==="futbol"||x==="fútbol").length, Vóley:a.filter(x=>x==="voley"||x==="vóley").length, Básquet:a.filter(x=>x==="basquet"||x==="básquet").length };
    }
  },
  32: {
    title: "🔐 Claves de la fiesta",
    description: "Comprueba cinco claves para permitir el ingreso.",
    prompt: "Ingresar las cinco claves en orden: TIENES, QUE SER, INVITADO, PARA, INGRESAR.",
    fields: ["Primera clave","Segunda clave","Tercera clave","Cuarta clave","Quinta clave"],
    calculate: (keys) => {
      const correct=["tienes","que ser","invitado","para","ingresar"];
      const ok=keys.every((x,i)=>x.trim().toLowerCase()===correct[i]);
      return { Resultado:ok?"BIENVENIDO A LA FIESTA":"TE EQUIVOCASTE DE FIESTA", "Acceso":ok?"PERMITIDO":"DENEGADO" };
    }
  }
};

function ExerciseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const number = Number(id);
  const exercise = exercises[number];
  const [values, setValues] = useState([]);
  const [result, setResult] = useState(null);

  const execute = (e) => {
    e.preventDefault();
    try {
      if (!exercise) throw Error("Este ejercicio no aparece implementado en el documento.");
      if (exercise.fields.length && (values.length !== exercise.fields.length || values.some(v => v == null || String(v).trim() === ""))) {
        throw Error("Completa todos los campos antes de ejecutar.");
      }
      const data = values.map((v,i) => {
        const field = exercise.fields[i];
        return typeof field === "object" && field.text ? v : Number(v);
      });
      setResult({ data: exercise.calculate(data) });
    } catch (error) {
      setResult({ error: error.message });
    }
  };

  const reset = () => { setValues([]); setResult(null); };

  return (
    <main className="exercise-detail">
      <button className="back-button" onClick={() => navigate("/ejercicios")}>
        <ArrowLeft size={18}/> Volver a ejercicios
      </button>

      <section className="detail-hero">
        <span className="welcome-label">CODELAB / EJERCICIO {String(number).padStart(2,"0")}</span>
        <h1>{exercise?.title || `🧩 Ejercicio ${number}`}</h1>
        <p>{exercise?.description || "Ejercicio práctico de programación en C#."}</p>
        <span className="detail-tag">🧠 Lógica de programación · C#</span>
      </section>

      <section className="detail-section">
        <div className="detail-section-title"><BookOpen size={22}/><h2>Enunciado</h2></div>
        <div className="detail-panel">
          <p>{exercise?.prompt || "Este número no figura entre los ejercicios del PDF."}</p>
        </div>
      </section>

      <section className="detail-section">
        <div className="detail-section-title"><Lightbulb size={22}/><h2>Prueba el ejercicio</h2></div>
        <div className="detail-panel">
          <form className="calculator-form" onSubmit={execute}>
            {exercise?.fields.map((field,i) => {
              const label = typeof field === "string" ? field : field.label;
              const isText = typeof field === "object" && field.text;
              return (
                <div className="calculator-field" key={label}>
                  <label htmlFor={`field-${i}`}>✍️ {label}</label>
                  <input
                    id={`field-${i}`}
                    type={isText ? "text" : "number"}
                    step="any"
                    value={values[i] ?? ""}
                    onChange={e => setValues(old => {
                      const next=[...old];
                      next[i]=e.target.value;
                      return next;
                    })}
                    placeholder={isText ? "Introduce los valores separados por comas..." : `Introduce ${label.toLowerCase()}`}
                  />
                </div>
              );
            })}
            {exercise?.fields.length === 0 && <p>Este ejercicio no necesita datos de entrada. Pulsa ejecutar.</p>}
            <div className="calculator-actions">
              <button className="exercise-button" type="submit"><Play size={18}/> Ejecutar ejercicio</button>
              <button className="reset-button" type="button" onClick={reset}><RotateCcw size={17}/> Reiniciar</button>
            </div>
          </form>

          {result && (
            <div className="calculator-result" aria-live="polite">
              <div className="result-heading"><Terminal size={20}/><h3>📊 Resultado</h3></div>
              {result.error ? (
                <p className="result-error">⚠️ {result.error}</p>
              ) : Object.entries(result.data).map(([label,value]) => (
                <div className="result-line" key={label}>
                  <span>{label}</span><strong>{String(value)}</strong>
                </div>
              ))}
              {!result.error && <p className="result-success">✓ Operación realizada correctamente.</p>}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default ExerciseDetail;
