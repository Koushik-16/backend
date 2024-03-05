// Function to calculate the total distance of a path
function totalDistance(path, graph) {
    let totalDist = 0;
    for (let i = 0; i < path.length - 1; i++) {
        totalDist += graph[path[i]][path[i + 1]];
    }
    totalDist += graph[path[path.length - 1]][path[0]];
    return totalDist;
}

// Function to generate initial population
function initialPopulation(popSize, numCities) {
    const population = [];
    for (let i = 0; i < popSize; i++) {
        const individual = [];
        for (let j = 0; j < numCities; j++) {
            individual.push(j);
        }
        shuffleArray(individual);
        population.push(individual);
    }
    return population;
}

// Function to shuffle an array (Fisher-Yates shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Function to perform tournament selection
function tournamentSelection(population, graph, tournamentSize) {
    const selectedParents = [];
    for (let i = 0; i < population.length; i++) {
        const tournament = [];
        for (let j = 0; j < tournamentSize; j++) {
            tournament.push(population[Math.floor(Math.random() * population.length)]);
        }
        selectedParents.push(tournament.reduce((prev, curr) => totalDistance(prev, graph) < totalDistance(curr, graph) ? prev : curr));
    }
    return selectedParents;
}

// Function to perform partially matched crossover (PMX)
function crossover(parent1, parent2) {
    const child = Array(parent1.length).fill(-1);
    const start = Math.floor(Math.random() * parent1.length);
    const end = Math.floor(Math.random() * (parent1.length - start)) + start;
    
    for (let i = start; i <= end; i++) {
        child[i] = parent1[i];
    }
    
    for (let i = 0; i < parent2.length; i++) {
        if (!child.includes(parent2[i])) {
            for (let j = 0; j < child.length; j++) {
                if (child[j] === -1) {
                    child[j] = parent2[i];
                    break;
                }
            }
        }
    }
    return child;
}

// Function to perform swap mutation
function mutation(individual) {
    const idx1 = Math.floor(Math.random() * individual.length);
    let idx2 = Math.floor(Math.random() * individual.length);
    while (idx2 === idx1) {
        idx2 = Math.floor(Math.random() * individual.length);
    }
    [individual[idx1], individual[idx2]] = [individual[idx2], individual[idx1]];
    return individual;
}

// Main genetic algorithm function
function  geneticAlgorithm(graph, popSize, numGenerations, tournamentSize, crossoverProb, mutationProb)  {
    const numCities = graph.length;
    let population = initialPopulation(popSize, numCities);
    
    for (let gen = 0; gen < numGenerations; gen++) {
        const nextGeneration = [];
        
        // Select parents using tournament selection
        const parents = tournamentSelection(population, graph, tournamentSize);
        
        // Perform crossover and mutation to create offspring
        for (let i = 0; i < parents.length; i += 2) {
            const parent1 = parents[i];
            const parent2 = parents[i + 1];
            
            const child1 = Math.random() < crossoverProb ? crossover(parent1, parent2) : parent1;
            const child2 = Math.random() < crossoverProb ? crossover(parent2, parent1) : parent2;
            
            nextGeneration.push(Math.random() < mutationProb ? mutation(child1) : child1);
            nextGeneration.push(Math.random() < mutationProb ? mutation(child2) : child2);
        }
        
        // Replace the old population with the new generation
        population = nextGeneration;
    }
    
    // Find the best individual in the final population
    const bestIndividual = population.reduce((prev, curr) => totalDistance(prev, graph) < totalDistance(curr, graph) ? prev : curr);
    const bestDistance = totalDistance(bestIndividual, graph);
    return [bestIndividual, bestDistance];
}

// Function to take input from user for adjacency matrix

// Main code
module.exports = geneticAlgorithm
