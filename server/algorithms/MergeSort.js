/**
 * Merge Sort Algorithm (Divide and Conquer)
 * Purpose in BookMyPlayground:
 * - Stable, predictable O(N log N) sorting of venues by price, rating, distance, or match percentage
 * - Step-by-step recording for Viva viva presentation
 * Time Complexity:
 * - Best: O(N log N)
 * - Average: O(N log N)
 * - Worst: O(N log N)
 * Space Complexity: O(N) auxiliary space
 */

function mergeSort(array, comparator = (a, b) => a - b, traceSteps = false) {
  const steps = [];

  function sort(arr, depth = 0, label = 'root') {
    if (arr.length <= 1) {
      return arr;
    }

    const mid = Math.floor(arr.length / 2);
    const left = arr.slice(0, mid);
    const right = arr.slice(mid);

    if (traceSteps) {
      steps.push({
        action: 'SPLIT',
        depth,
        label,
        leftLength: left.length,
        rightLength: right.length,
        description: `Split array of length ${arr.length} into left [${left.length}] and right [${right.length}].`,
      });
    }

    const sortedLeft = sort(left, depth + 1, `${label}->L`);
    const sortedRight = sort(right, depth + 1, `${label}->R`);

    const merged = merge(sortedLeft, sortedRight);

    if (traceSteps) {
      steps.push({
        action: 'MERGE',
        depth,
        label,
        mergedLength: merged.length,
        description: `Merged sorted sub-arrays into sorted chunk of length ${merged.length}.`,
      });
    }

    return merged;
  }

  function merge(left, right) {
    const result = [];
    let i = 0;
    let j = 0;

    while (i < left.length && j < right.length) {
      if (comparator(left[i], right[j]) <= 0) {
        result.push(left[i]);
        i++;
      } else {
        result.push(right[j]);
        j++;
      }
    }

    while (i < left.length) {
      result.push(left[i]);
      i++;
    }

    while (j < right.length) {
      result.push(right[j]);
      j++;
    }

    return result;
  }

  const sortedArray = sort(array);

  return {
    sorted: sortedArray,
    steps,
  };
}

module.exports = { mergeSort };
