class Network {
    constructor (x_position, y_position, x_velocity, y_velocity) {
        // Nodes co-ordinates of the network
        this.xPosition = x_position;
        this.yPosition = y_position;
        this.xVelocity = x_velocity;
        this.yVelocity = y_velocity;
        // Fitness of network
        this.fitness = 0;
        // Sequence vector and clusters of the network
        this.sequenceVector = [];
        this.clusters = {};
        this.PBESTX = null;
        this.PBESTY = null;
        this.PBESTFITNESS = -Infinity;
        this.PBESTSV = null;
        this.PBESTCLUSTERS = null;

        // Cluster variable rVar 
        this.rVar = floor(random(minCN, maxCN))

        this.t = percent * this.xPosition.length;
    }

    /**
     * Function to dissipate energy. This is the best network at that time
     */
    drainEnergy() {
        // Parse the best clusters
        let clusters = JSON.parse(this.PBESTCLUSTERS);
        for (const [cn_index, common_node_indices] of Object.entries(clusters)) {
            // Common nodes sending to control node
            for (let i = 0; i < common_node_indices.length; i++) {
                let energyConsumed = transmitCommonToControl(packetLength, dist(this.xPosition[cn_index], this.yPosition[cn_index], this.xPosition[common_node_indices[i]], this.yPosition[common_node_indices[i]]));
                energy[common_node_indices[i]] = energy[common_node_indices[i]] - energyConsumed;
                // console.log("common node",energy[common_node_indices[i]])
            }
            // Control node sending collective data to control server
            let closestSinkIndex = closestSink(this.xPosition[cn_index], this.yPosition[cn_index], sinks);
            let energyConsumed = transmitControlToSink(packetLength * common_node_indices.length, dist(this.xPosition[cn_index], this.yPosition[cn_index], sinks[closestSinkIndex].x, sinks[closestSinkIndex].y))
            energy[cn_index] = energy[cn_index] - energyConsumed;
            // console.log("ccontrol node",energy[cn_index])
        }
    }

    /**
     * Function sending broadcast message to common nodes
     */
    advertiseMessage () {
        // Parse the best clusters
        let clusters = JSON.parse(this.PBESTCLUSTERS);
        for (const [cn_index, common_node_indices] of Object.entries(clusters)) 
            for (let i = 0; i < common_node_indices.length; i++) {
                let energyConsumed = transmitCommonToControl(advertisePacketLength, dist(this.xPosition[cn_index], this.yPosition[cn_index], this.xPosition[common_node_indices[i]], this.yPosition[common_node_indices[i]]));
                energy[cn_index] = energy[cn_index] - energyConsumed;
            }
    }

    /**
     * Distance fitness calculation
     */
    calculateDistanceFitness (clusters) {
        let commonToControl = 0;
        // Loop through each entry in the cluster object. cn_index: is control node index and second one is list of common nodes corresponding to the 
        // control node
        for (const [cn_index, common_node_indices] of Object.entries(clusters)) 
            for (let i = 0; i < common_node_indices.length; i++) 
                commonToControl += dist(this.xPosition[cn_index], this.yPosition[cn_index], this.xPosition[common_node_indices[i]], this.yPosition[common_node_indices[i]]);
        commonToControl = commonToControl / (this.xPosition.length - this.rVar);  
        // Find the distance of control head to closest sink 
        let controlToSink = 0;
        for (const [cn_index] of Object.entries(clusters)) {
            let closestSinkIndex = closestSink(this.xPosition[cn_index], this.yPosition[cn_index], sinks);
            controlToSink += dist(this.xPosition[cn_index], this.yPosition[cn_index], sinks[closestSinkIndex].x, sinks[closestSinkIndex].y);
        }
        controlToSink = controlToSink / this.rVar;
        return (1 / ((commonToControl + controlToSink) / 2));
        // return commonToControl / controlToSink;
    }

    /**
     * Function to calculate energy fitness based on energy dissipation model
     * @param {*} clusters 
     */
    calculateEnergyFitness(clusters) {
        let commonToControl = 0;
        // Energy dissipation count within clusters
        for (const [cn_index, common_node_indices] of Object.entries(clusters)) 
            for (let i = 0; i < common_node_indices.length; i++) 
                commonToControl += transmitCommonToControl(packetLength, dist(this.xPosition[cn_index], this.yPosition[cn_index], this.xPosition[common_node_indices[i]], this.yPosition[common_node_indices[i]]));
        commonToControl = commonToControl / (this.xPosition.length - this.rVar);      
        // Energy dissipation from control node to control server
        let controlToSink = 0;
        for (const [cn_index] of Object.entries(clusters)) {
            let closestSinkIndex = closestSink(this.xPosition[cn_index], this.yPosition[cn_index], sinks);
            controlToSink += transmitControlToSink(packetLength, dist(this.xPosition[cn_index], this.yPosition[cn_index], sinks[closestSinkIndex].x, sinks[closestSinkIndex].y))
        }
        controlToSink = controlToSink / this.rVar;
        return (controlToSink / commonToControl);
        // return (commonToControl / controlToSink)
    }

    calculateHeterogenityFitness(clusters) {
        let factor = 0;
        for (const [cn_index] of Object.entries(clusters)) {
            if (nodeType[cn_index] == "A") factor += 0.05;
            else if (nodeType[cn_index] == "I") factor += 0.03;
            else factor += 0.01;
        }
        return factor;
    }

    /**
     * Function to find fitness of the network
     */
    calculateFitness(clusters) {
        // Calculate distance fitness
        let distanceFitness = this.calculateDistanceFitness(clusters);
        // Calculate energy fitness
        let energyFitness = this.calculateEnergyFitness(clusters)
        let heterogenityFitness = this.calculateHeterogenityFitness(clusters);
        let fitness = alpha * energyFitness + beta * distanceFitness + heterogenityFitness;
        // let fitness = energyFitness  + distanceFitness;
        return fitness;
    }

    /**
     * Function to find closest control node from i'th node
     */
    closestCN(i, cnIndices) {
        let closestIndex = -1;
        let d = Infinity;
        for (let cn = 0; cn < cnIndices.length; cn++) {
            let distance = dist(this.xPosition[cnIndices[cn]], this.yPosition[cnIndices[cn]], this.xPosition[i], this.yPosition[i]);
            if (distance < d) {
                d = distance;
                closestIndex = cnIndices[cn];
            }
        }
        return closestIndex;
    }

    /**
     * Function to generate clusters. Depends on sequence vector and rVar
     */
    enumerateClusters (sequence_vector) {
        let cluster = {};
        let cnIndices = [];
        // Pick first rVar nodes as CH
        for (let i = 0; i < sequence_vector.length; i++) {
            if (i == this.rVar)
                break;
            cluster[sequence_vector[i]] = [];        
            cnIndices.push(sequence_vector[i]);    
        }
        // Enumerate clusters with common nodes 
        for (let i = 0; i < this.xPosition.length; i++) {
            if (!cnIndices.includes(i)) {
                let closestIndex = this.closestCN(i, cnIndices);
                cluster[closestIndex].push(i);
            }
        }
        return cluster;
    }

    /**
     * Apply FJAPSO
     */
    update (gbest_x, gbest_y) {
        // Update every particle 
        for (let i = 0; i < this.xPosition.length; i++) {
            // update velocity
            this.xVelocity[i] = inertia * this.xVelocity[i] + c1 * random(1) * (this.PBESTX[i] - this.xPosition[i]) + c2 * random(1) * (gbest_x[i] - this.xPosition[i]);
            this.yVelocity[i] = inertia * this.yVelocity[i] + c1 * random(1) * (this.PBESTY[i] - this.yPosition[i]) + c2 * random(1) * (gbest_y[i] - this.yPosition[i]);
            this.checkVelocityBounds();
            // update position
            this.xPosition[i] = this.xPosition[i] + this.xVelocity[i];
            this.yPosition[i] = this.yPosition[i] + this.yVelocity[i];
            // Check the bounds
            this.checkPositionBounds();
        }
        // Apply fork and join
        this.forkAndJoin();
        // Update the PBEST
        this.updatePBEST();
    }

    forkAndJoin() {
        // Create t children using GMO on sequence vector of the network
        let seqVector = SPV(this.xPosition);
        let bestChildSV = null;
        let bestChildClusters = null;
        let bestChildFitness = -Infinity;
        for (let c = 0; c < this.t; c++) {
            // Apply GMO to get new child sequence vector
            let childSV = GMO(seqVector, this.rVar);
            // Calcuate fitness of child network
            let childClusters = this.enumerateClusters(childSV);
            let childFitness = this.calculateFitness(childClusters);
            if (childFitness > bestChildFitness) {
                bestChildFitness = childFitness;
                bestChildSV = childSV;
                bestChildClusters = childClusters;
            }
        }
        // Till this point best children parameters are saved in variables
        this.sequenceVector = bestChildSV.slice();
        this.clusters = bestChildClusters;
        this.fitness = bestChildFitness;
    }

    updatePBEST() {
        if (this.fitness > this.PBESTFITNESS) {
            this.PBESTFITNESS = this.fitness;
            this.PBESTSV = this.sequenceVector.slice();
            this.PBESTX = this.xPosition.slice();
            this.PBESTY = this.yPosition.slice();
            this.PBESTCLUSTERS = JSON.stringify(this.clusters);
        }
    }

    checkVelocityBounds () {
        for (let i = 0; i < this.xVelocity.length; i++) {
            if (this.xVelocity[i] < vMin)
                this.xVelocity[i] = vMin;
            else if (this.xVelocity[i] > vMax)
                this.xVelocity[i] = vMax
            if (this.yVelocity[i] < vMin)
                this.yVelocity[i] = vMin;
            else if (this.yVelocity[i] > vMax)
                this.yVelocity[i] = vMax
        }
    }

    checkPositionBounds () {
        for (let i = 0; i < this.xPosition.length; i++) {
            if (this.xPosition[i] < 100)  
                this.xPosition[i] = 100;
            else if (this.xPosition[i] > w + 100)
                this.xPosition[i] = w + 100;
            if (this.yPosition[i] < 100)
                this.yPosition[i] = 100;
            else if (this.yPosition[i] > h + 100)
                this.yPosition[i] = h + 100;
        }
    }

    display () {
        for (let i = 0; i < this.PBESTX.length; i++) {
            noStroke()
            if (this.clusters[i] == undefined)
                fill(0, 255, 0);
            else fill(255, 0, 0)
            ellipse(this.PBESTX[i], this.PBESTY[i], 2.5)
        }
    }
}