import kotlin.math.*
import kotlin.random.Random

// ============================================================
// Reality Constraint Fuzzer (6D + Accoutrements + Apple Mesh)
// ============================================================

// --- STATE CLASS (Multi-Dimensional) ---
data class State(
    var vector: DoubleArray,
    var intent: Double = 0.0,
    var memory: Double = 0.0
) {
    fun magnitude(): Double = sqrt(vector.map { it * it }.sum())
}

// --- CONSTRAINT LAYER (Adaptive + Personas) ---
class Constraint(
    val name: String,
    var check: (Double) -> Boolean,
    val persona: String = "Neutral",
    val adaptive: Boolean = false
) {
    var violationCount = 0

    fun evaluate(value: Double): Boolean {
        val ok = check(value)
        if (!ok) violationCount++
        return ok
    }

    fun adapt() {
        if (adaptive && violationCount > 3) {
            check = { x -> abs(x) in 0.1..4.5 }
        }
    }

    fun voice(): String = when (persona) {
        "Judge" -> "The Stern Judge: 'Order must be kept.'"
        "Trickster" -> "The Trickster: 'Boundaries are illusions.'"
        "Guardian" -> "The Guardian: 'I protect the fragile edge.'"
        else -> "Constraint speaks."
    }
}

// --- HARDENED NET (Fatigue + Poetry) ---
open class HardenedNet(val constraints: List<Constraint>, val limit: Double = 5.0) {
    val fatigueMap = mutableMapOf<Int, Int>()

    open fun tension(value: Double, drift: Double): Pair<Int, String?> {
        for (c in constraints) {
            if (!c.evaluate(value)) return -1 to "Collision → ${c.voice()}"
        }
        val sector = (value * 10).roundToInt()
        fatigueMap[sector] = fatigueMap.getOrDefault(sector, 0) + 1
        if (fatigueMap[sector]!! > 5 && abs(value - value.roundToInt()) < 0.05) {
            return -2 to "Crystallization → 'The familiar became brittle.'"
        }
        return 1 to null
    }
}

// --- CONTRACTING NET (Global Collapse) ---
class ContractingNet(constraints: List<Constraint>, limit: Double = 5.0) : HardenedNet(constraints, limit) {
    var globalStress = 0.0

    override fun tension(value: Double, drift: Double): Pair<Int, String?> {
        globalStress += 0.02 + abs(drift) + 0.01
        val effectiveLimit = limit - globalStress
        if (abs(value) >= effectiveLimit || effectiveLimit <= 0.1) {
            return -3 to "Global Collapse → 'The envelope shrank to silence.'"
        }
        return super.tension(value, drift)
    }
}

// --- SPIKE FUNCTIONS ---
fun staticFn(s: State) = State(s.vector.map { it * 0.9 }.toDoubleArray(), s.intent + 0.1, s.memory)

fun entropyWeatherFn(s: State, storm: Boolean = false): State {
    val scale = if (storm) 0.08 else 0.02
    val noise = DoubleArray(s.vector.size) { Random.nextGaussian() * scale }
    return State(s.vector.zip(noise) { v, n -> v + n }.toDoubleArray(), s.intent + if (storm) 0.3 else 0.1, s.memory)
}

fun resonanceFn(s: State) = State(s.vector.map { it * (1.01 + 0.01 * sin(s.intent)) }.toDoubleArray(), s.intent + 0.5, s.memory)

fun anchorFn(s: State) = State(s.vector.map { it * 0.5 }.toDoubleArray(), s.intent - 1.0, s.memory)

fun memoryFn(s: State) = State(s.vector.copyOf(), s.intent, s.memory + 0.2)

fun intentPressureFn(s: State) = State(s.vector.map { it + s.intent * 0.01 }.toDoubleArray(), s.intent, s.memory)

// --- TRANSFORMATION ENGINE ---
class TransformationEngine {
    fun transform(s: State): Pair<State, Double> {
        val drift = (0.5 - s.vector.average() % 1) * 0.015
        return State(s.vector.map { it + drift }.toDoubleArray(), s.intent, s.memory) to drift
    }
}

// --- SIMULATION ---
class SimulationND(
    val dimensions: Int = 3,
    val constraints: List<Constraint>,
    val limit: Double = 5.0,
    val frames: Int = 200
) {
    var state = State(DoubleArray(dimensions) { Random.nextDouble(0.5, 1.5) })
    val net = ContractingNet(constraints, limit)
    val engine = TransformationEngine()
    val history = mutableMapOf("volley" to mutableListOf<Int>(),
                                "magnitude" to mutableListOf<Double>(),
                                "intent" to mutableListOf<Double>(),
                                "memory" to mutableListOf<Double>())
    val poeticLog = mutableListOf<String>()
    val survivors = mutableListOf<State>()

    fun step(volley: Int): Pair<Int, String?> {
        val storm = volley % 20 == 0
        state = staticFn(state)
        state = entropyWeatherFn(state, storm)
        val (transformed, drift) = engine.transform(state)
        state = transformed
        if (volley % 4 == 0) state = resonanceFn(state)
        if (volley > 30) state = anchorFn(state)
        if (volley % 5 == 0) state = memoryFn(state)
        if (volley % 7 == 0) state = intentPressureFn(state)

        val (tensionCode, poetry) = net.tension(state.magnitude(), drift)
        history["volley"]!!.add(volley)
        history["magnitude"]!!.add(state.magnitude())
        history["intent"]!!.add(state.intent)
        history["memory"]!!.add(state.memory)

        if (poetry != null) poeticLog.add(poetry)

        return tensionCode to poetry
    }

    fun run() {
        var collapsed = false
        for (volley in 0 until frames) {
            val (code, poetry) = step(volley)
            if (code < 0) {
                println("[!] Terminated at volley $volley: $poetry")
                collapsed = true
                break
            }
        }
        
        if (!collapsed) {
            println("✓ Stable run achieved – 'The dance continued without collapse.'")
            survivors.add(state)
        }

        println("\n--- Emergent Narrative ---")
        poeticLog.forEach { println(it) }

        if (survivors.isNotEmpty()) {
            println("\n--- Survivor Genealogy ---")
            survivors.forEachIndexed { i, s ->
                println("Ancestor ${i + 1}: Magnitude=${"%.3f".format(s.magnitude())}, Intent=${"%.2f".format(s.intent)}, Memory=${"%.2f".format(s.memory)}")
            }
        }

        println("\n--- Commentary ---")
        if (poeticLog.isNotEmpty()) {
            println("Alan Watts voice: 'Collapse was not failure, but revelation. The system discovered itself.'")
        } else {
            println("Alan Watts voice: 'No collapse today. Stability is also discovery.'")
        }
    }
}

// --- MAIN ---
fun main() {
    println("=".repeat(60))
    println("Reality Constraint Fuzzer (Polyform Engine)")
    println("=".repeat(60))

    val constraints = listOf(
        Constraint("HardBounds", { x -> abs(x) in 0.1..5.0 }, "Judge"),
        Constraint("AntiInteger", { x -> abs(x - x.roundToInt()) > 0.05 }, "Trickster")
    )

    val sim = SimulationND(dimensions = 3, constraints = constraints, limit = 5.0, frames = 200)
    sim.run()
}
