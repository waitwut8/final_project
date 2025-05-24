def way_1(array: list[int]): # fool-proof way, assuming equal difference between elements
    array = sorted(array)
    return (array[-1]+array[0])/2*len(array)

def way_2(): #assume list is 1, 2, 3... 99, 100
    return (100+1)/2*100

def way_3(array): # naive method to loop through array, O(n) time complexity
    return sum(array)
from functools import reduce
from operator import add

def way_4(array): #3rd party
    return reduce(add, array)

to_test = [x for x in range(1,101)]
print(to_test)
print(way_1(array=to_test), way_2(), way_3(to_test), way_4(to_test))