export default function sortArr(array, key = (value) => value, direction = "asc") {
    const localData = [...array];
    for (let i = 0; i < localData.length - 1; i++) {
        for (let j = i + 1; j < localData.length; j++) {
            if (key(localData[i]) > key(localData[j])) {
                const temp = localData[i];
                localData[i] = localData[j];
                localData[j] = temp;
            }
        }
    }
    if (direction === "desc") {
        localData.reverse();
    }
    return localData;
}