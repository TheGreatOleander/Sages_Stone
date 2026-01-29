// rcf.c - Reality Constraint Fuzzer
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <string.h>
#include <time.h>

#define MAX_DIMENSIONS 10
#define MAX_CONSTRAINTS 10
#define MAX_FATIGUE 100

typedef struct {
    double vector[MAX_DIMENSIONS];
    int dimensions;
    double intent;
    double memory;
} State;

typedef struct {
    char name[50];
    int (*check)(double);
    char persona[20];
    int adaptive;
    int violation_count;
} Constraint;

typedef struct {
    int sector;
    int count;
} FatigueEntry;

typedef struct {
    Constraint *constraints;
    int num_constraints;
    double limit;
    FatigueEntry fatigue_map[MAX_FATIGUE];
    int fatigue_count;
    double global_stress;
} ContractingNet;

// Random normal distribution (Box-Muller)
double randn() {
    double u1 = (double)rand() / RAND_MAX;
    double u2 = (double)rand() / RAND_MAX;
    return sqrt(-2.0 * log(u1)) * cos(2.0 * M_PI * u2);
}

double magnitude(State *s) {
    double sum = 0.0;
    for (int i = 0; i < s->dimensions; i++) {
        sum += s->vector[i] * s->vector[i];
    }
    return sqrt(sum);
}

const char* constraint_voice(Constraint *c) {
    if (strcmp(c->persona, "Judge") == 0) {
        return "The Stern Judge: 'Order must be kept.'";
    } else if (strcmp(c->persona, "Trickster") == 0) {
        return "The Trickster: 'Boundaries are illusions.'";
    } else if (strcmp(c->persona, "Guardian") == 0) {
        return "The Guardian: 'I protect the fragile edge.'";
    }
    return "Constraint speaks without drama.";
}

// Spike Functions
void static_fn(State *s, State *result) {
    result->dimensions = s->dimensions;
    for (int i = 0; i < s->dimensions; i++) {
        result->vector[i] = s->vector[i] * 0.9;
    }
    result->intent = s->intent + 0.1;
    result->memory = s->memory;
}

void entropy_weather_fn(State *s, int storm, State *result) {
    double scale = storm ? 0.08 : 0.02;
    result->dimensions = s->dimensions;
    for (int i = 0; i < s->dimensions; i++) {
        result->vector[i] = s->vector[i] + randn() * scale;
    }
    result->intent = s->intent + (storm ? 0.3 : 0.1);
    result->memory = s->memory;
}

void resonance_fn(State *s, State *result) {
    double factor = 1.01 + 0.01 * sin(s->intent);
    result->dimensions = s->dimensions;
    for (int i = 0; i < s->dimensions; i++) {
        result->vector[i] = s->vector[i] * factor;
    }
    result->intent = s->intent + 0.5;
    result->memory = s->memory;
}

void anchor_fn(State *s, State *result) {
    result->dimensions = s->dimensions;
    for (int i = 0; i < s->dimensions; i++) {
        result->vector[i] = s->vector[i] * 0.5;
    }
    result->intent = s->intent - 1.0;
    result->memory = s->memory;
}

void memory_fn(State *s, State *result) {
    *result = *s;
    result->memory = s->memory + 0.2;
}

void intent_pressure_fn(State *s, State *result) {
    result->dimensions = s->dimensions;
    for (int i = 0; i < s->dimensions; i++) {
        result->vector[i] = s->vector[i] + s->intent * 0.01;
    }
    result->intent = s->intent;
    result->memory = s->memory;
}

void transform(State *s, State *result, double *drift) {
    double sum = 0.0;
    for (int i = 0; i < s->dimensions; i++) {
        sum += s->vector[i];
    }
    double mean = sum / s->dimensions;
    *drift = (0.5 - fmod(mean, 1.0)) * 0.015;
    
    result->dimensions = s->dimensions;
    for (int i = 0; i < s->dimensions; i++) {
        result->vector[i] = s->vector[i] + *drift;
    }
    result->intent = s->intent;
    result->memory = s->memory;
}

int tension(ContractingNet *net, double value, double drift, char *message) {
    // Check constraints
    for (int i = 0; i < net->num_constraints; i++) {
        if (!net->constraints[i].check(value)) {
            net->constraints[i].violation_count++;
            sprintf(message, "Collision → %s", constraint_voice(&net->constraints[i]));
            return -1;
        }
    }
    
    // Update global stress
    net->global_stress += 0.02 + fabs(drift) + 0.01;
    double effective_limit = net->limit - net->global_stress;
    
    if (fabs(value) >= effective_limit || effective_limit <= 0.1) {
        strcpy(message, "Global Collapse → 'The envelope shrank to silence.'");
        return -3;
    }
    
    // Check fatigue
    int sector = (int)round(value * 10);
    int found = -1;
    for (int i = 0; i < net->fatigue_count; i++) {
        if (net->fatigue_map[i].sector == sector) {
            found = i;
            break;
        }
    }
    
    if (found >= 0) {
        net->fatigue_map[found].count++;
        if (net->fatigue_map[found].count > 5 && fabs(value - round(value)) < 0.05) {
            strcpy(message, "Crystallization → 'The familiar became brittle.'");
            return -2;
        }
    } else if (net->fatigue_count < MAX_FATIGUE) {
        net->fatigue_map[net->fatigue_count].sector = sector;
        net->fatigue_map[net->fatigue_count].count = 1;
        net->fatigue_count++;
    }
    
    message[0] = '\0';
    return 1;
}

// Constraint check functions
int hard_bounds_check(double x) {
    return fabs(x) > 0.1 && fabs(x) < 5.0;
}

int anti_integer_check(double x) {
    return fabs(x - round(x)) > 0.05;
}

int main() {
    srand(time(NULL));
    
    printf("============================================================\n");
    printf("Reality Constraint Fuzzer (Polyform Engine)\n");
    printf("============================================================\n");
    
    // Setup constraints
    Constraint constraints[2];
    strcpy(constraints[0].name, "HardBounds");
    constraints[0].check = hard_bounds_check;
    strcpy(constraints[0].persona, "Judge");
    constraints[0].adaptive = 0;
    constraints[0].violation_count = 0;
    
    strcpy(constraints[1].name, "AntiInteger");
    constraints[1].check = anti_integer_check;
    strcpy(constraints[1].persona, "Trickster");
    constraints[1].adaptive = 0;
    constraints[1].violation_count = 0;
    
    // Setup net
    ContractingNet net;
    net.constraints = constraints;
    net.num_constraints = 2;
    net.limit = 5.0;
    net.fatigue_count = 0;
    net.global_stress = 0.0;
    
    // Initialize state
    State state;
    state.dimensions = 3;
    for (int i = 0; i < state.dimensions; i++) {
        state.vector[i] = ((double)rand() / RAND_MAX) * 1.0 + 0.5;
    }
    state.intent = 0.0;
    state.memory = 0.0;
    
    // Run simulation
    int frames = 200;
    int collapsed = 0;
    char message[200];
    
    for (int volley = 0; volley < frames; volley++) {
        int storm = (volley % 20 == 0);
        
        State temp;
        static_fn(&state, &temp);
        state = temp;
        
        entropy_weather_fn(&state, storm, &temp);
        state = temp;
        
        double drift;
        transform(&state, &temp, &drift);
        state = temp;
        
        if (volley % 4 == 0) {
            resonance_fn(&state, &temp);
            state = temp;
        }
        if (volley > 30) {
            anchor_fn(&state, &temp);
            state = temp;
        }
        if (volley % 5 == 0) {
            memory_fn(&state, &temp);
            state = temp;
        }
        if (volley % 7 == 0) {
            intent_pressure_fn(&state, &temp);
            state = temp;
        }
        
        int code = tension(&net, magnitude(&state), drift, message);
        
        if (code < 0) {
            printf("[!] Terminated at volley %d: %s\n", volley, message);
            collapsed = 1;
            break;
        }
    }
    
    if (!collapsed) {
        printf("✓ Stable run achieved – 'The dance continued without collapse.'\n");
    }
    
    printf("\n--- Commentary ---\n");
    if (collapsed) {
        printf("Alan Watts voice: 'Collapse was not failure, but revelation. The system discovered itself.'\n");
    } else {
        printf("Alan Watts voice: 'No collapse today. Stability is also discovery.'\n");
    }
    
    return 0;
}