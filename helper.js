function SPV (position_vector) {
    let sorted = position_vector.slice();    // Copy
    sort(sorted);
    let sequenceVector = [];
    for (let i = 0; i < position_vector.length; i++) {
        // Find index in sorted array
        let index = sorted.indexOf(position_vector[i]);
        sequenceVector.push(index);
    }
    return sequenceVector;
}

function closestSink (x, y, sinks) {
    let closestIndex = -1;
    let d = Infinity
    for (let i = 0; i < sinks.length; i++) {
        let distance = dist(x, y, sinks[i].x, sinks[i].y);
        if (distance < d) {
            d = distance;
            closestIndex = i;
        }
    }
    return closestIndex;
}

function GMO(sequence_vector, r_var) {
    let seqVector = sequence_vector.slice();
    let randomNumber1 = floor(random(r_var));
    let randomNumber2 = floor(random(randomNumber1, sequence_vector.length))
    let temp = seqVector[randomNumber1];
    seqVector[randomNumber1] = seqVector[randomNumber2];
    seqVector[randomNumber2] = temp;
    return seqVector;
}

function transmitCommonToControl(packet_length, distance) {
    let energyConsumed = 0;
    if (distance < dThreshold)
        energyConsumed = packet_length * eElec + packet_length * Efs * pow(distance, 2);
    else 
        energyConsumed = packet_length * eElec + packet_length * Emp * pow(distance, 4);
    return energyConsumed;
}

function transmitControlToSink(packet_length, distance) {
    let energyConsumed = 0;
    if (distance < dThreshold)
        energyConsumed = packet_length * (eElec + Eda) + packet_length * Efs * pow(distance, 2);
    else 
        energyConsumed = packet_length * (eElec + Eda) + packet_length * Emp * pow(distance, 4);
    return energyConsumed;
}

