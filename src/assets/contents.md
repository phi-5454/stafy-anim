## A simple model for heat in a solid 
What you see here is a simulation* of a something resembling an [Einstein solid](https://en.wikipedia.org/wiki/Einstein_solid). Each pixel in the grid (lattice) represents an "energy store". Each such store may hold an integer number of discrete energy packets, **energy quanta**. The colors of the pixels represent the number of quanta in each. The brighter the pixel, the more quanta. The number of energy quanta in the whole system remains fixed: the total system is **isolated**.

The simulation works in discrete time steps (You can change the length of this time step using the **interactive GUI**). At each timestep, all of the energy quanta are partitioned into the lattice. This is done in such a manner that each final configuration of the lattice ("microstate") is equally likely ([using the "stars and bars" method](https://en.wikipedia.org/wiki/Stars_and_bars_(combinatorics))). 

In this isolated system, a subset of pixels is highlighted in *blue*. Let's call this **the system**, since its properties are particularly interesting. The histogram displays the abundances of different energies within **the system**. I.e., when running our simulation, how many times has **the system** contained n quanta?

Try to change the different parameters of the simulation, using the **interactive GUI**, and observe the effects on the distribution. For instance, try to shrink the size of the system all the way down to 1. What do you think will happen to the distribution? How does the total energy in the system affect this? ([Hint](https://en.wikipedia.org/wiki/Canonical_ensemble#Boltzmann_distribution_(separable_system)))

\* This type of simulation, where random samples are repeatedly taken (in this case, samples of the [configuration space](https://en.wikipedia.org/wiki/Configuration_space_(physics)) of the total system), is called a [Monte Carlo simulation](https://en.wikipedia.org/wiki/Monte_Carlo_method)

