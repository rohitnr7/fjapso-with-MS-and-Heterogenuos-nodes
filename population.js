class Population {
    constructor (pop_size) {
        this.size = pop_size;
        // Each network is a swarm of particles
        this.networks = new Array(this.size);
        // GBEST
        this.GBESTINDEX = -1;
        this.GBESTX = null;
        this.GBESTY = null;
        this.GBESTFITNESS = -Infinity;
        this.GBESTSV = null;
    }

    /**
     * Function to dissipate energy 
     */
    drainEnergy() {
        this.networks[this.GBESTINDEX].drainEnergy();
    }

    advertiseMessage() {
        this.networks[this.GBESTINDEX].advertiseMessage();
    }

    /**
     * Boot function: Create a population of networks containing n nodes each
     */
    boot (number_of_nodes_per_network) {
        for (let i = 0; i < this.size; i++) {
            // Create networks here
            let xp = [], yp = [], xv = [], yv = [];
            for (let j = 0; j < number_of_nodes_per_network; j++) {
                let temp = null;
                // Generate position
                xp.push(random(w) + 100)
                yp.push(random(h) + 100)
                // Generate velocity
                xv.push(vMin + (vMax - vMin) * random(1))
                yv.push(vMin + (vMax - vMin) * random(1))          
            }
            let newNetwork = new Network(xp, yp, xv, yv);
            // Apply SPV to generate clusters
            newNetwork.sequenceVector = SPV(newNetwork.xPosition);
            // Generate Clusters
            newNetwork.clusters = newNetwork.enumerateClusters(newNetwork.sequenceVector);
            // Calculate fitness
            newNetwork.fitness = newNetwork.calculateFitness(newNetwork.clusters)
            newNetwork.PBESTX = newNetwork.xPosition.slice();
            newNetwork.PBESTY = newNetwork.yPosition.slice();
            newNetwork.PBESTFITNESS = newNetwork.fitness;
            newNetwork.PBESTSV = newNetwork.sequenceVector.slice();
            // Add the network to the network array
            this.networks[i] = newNetwork;
        }
        // Find the GBEST from the network
        this.updateGBEST();
    }

    updateGBEST () {
        for (let i = 0; i < this.networks.length; i++) {
            if (this.networks[i].PBESTFITNESS > this.GBESTFITNESS) {
                // Update the gbest values
                this.GBESTINDEX = i;
                this.GBESTX = this.networks[i].PBESTX.slice();
                this.GBESTY = this.networks[i].PBESTY.slice();
                this.GBESTFITNESS = this.networks[i].PBESTFITNESS;
                this.GBESTSV = this.networks[i].PBESTSV;
                // console.log(this.GBESTFITNESS)
                fitnessHistory.push(this.GBESTFITNESS)
            }
        }
    }

    /**
     * Function to apply PSO on every network
     */
    update () {
        // Try damping on inertia
        inertia = inertia - 0.02*inertia;
        for (let i = 0; i < this.networks.length; i++)  {
            this.networks[i].update(this.GBESTX, this.GBESTY);
        }
        this.updateGBEST();
    }


    display () {
        this.networks[this.GBESTINDEX].display();
    }
}