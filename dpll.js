/**
 * Created by anil on 09/04/2019.
 */
const fs = require('fs');

function parse(filename) {
    var text = fs.readFile(filename);
    var textByLine = text.split("\n");
    var line;
    var clauses = [];
    for (line in textByLine){
        if (line.startsWith("c")){
            continue;
        }
        if (line.startsWith("p")){
            var n_vars = line.split(" ")[2];
            continue;
        }
        var clause = line.slice(0, -2).split(" ").map(Number);
        clauses.push(clause);

    }
    return [clauses, n_vars]
}

function remove(arrOriginal, elementToRemove){
    return arrOriginal.filter(function(el){return el !== elementToRemove});
}

function bcp(formula, unit) {
    var modified = [];
    var clause;
    for (clause in formula) {
        if (unit in clause) {
            continue;
        }
        if (-unit in clause) {
            var new_clause = remove(clause, -unit);
            if (new_clause === []){
                return -1
            }
            modified.push(new_clause);
        }
        else {
            modified.push(clause)
        }
    }
    return modified
}


function get_weighted_counter(formula, weight) {
    var counter = {};
    var clause;
    var literal;
    for (clause in formula) {
        for (literal in clause){
            if (literal in counter) {
                counter[literal] += Math.pow(weight, -clause.length)
            }
            else {
                counter[literal] = Math.pow(weight, -clause.length)
            }

        }
    }
    return counter
}

function jeroslow_wang(formula) {
    var counter = get_weighted_counter(formula);
    var maxKey = _.max(Object.keys(counter), o => counter[o]);
    return maxKey
}

function unit_propagation(formula) {
    var assignment = [];
    var c;
    var unit_clauses = [];
    for (c in formula) {
        if (c.length === 1){
            unit_clauses.push(c);
        }
    }
    while (unit_clauses) {
        var unit = unit_clauses[0];
        formula = bcp(formula, unit[0]);
        assignment.push(unit[0]);
        if (formula === -1) {
            return [-1, []]
        }
        if (!formula) {
            return [formula, assignment]
        }

        unit_clauses = [];
        for (c in formula) {
            if (c.length === 1){
            unit_clauses.push(c);
            }
        }
    }
    return [formula, assignment]
}

function backtracking(formula, assignment) {
    var up = unit_propagation(formula);
    var formula = up[0];
    var unit_assignment = up[1];
    assignment = assignment + unit_assignment;
    if (formula === -1) {
        return []
    }
    if (!formula){
        return assignment
    }
    var variable = jeroslow_wang(formula);
    var solution;
    solution = backtracking(bcp(formula, variable), assignment + [variable]);
    if (!solution) {
        solution = backtracking(bcp(formula, variable), assignment + [-variable]);
    }
    return solution
}


var parsed_file = parse('test.txt');
var clauses = parsed_file[0];
var n_vars = parsed_file[1];

var solution = backtracking(clauses, []);

if (solution) {
    for (const i in Array(n_vars).keys()){
        if (!(i+1 in solution) && !(-(i+1) in solution)){
            solution.push(i+1)
        }
    }
    prettyPrint('SATISFIABLE');
    prettyPrint(solution);
}
else {
    prettyPrint('UNSATISFIABLE');
}