#include <wiringPi.h>
#include <stdio.h>
#include <stdlib.h>
#include <getopt.h>
#include <unistd.h>
#include <ctype.h>
#include <iostream>
#include <dht.h>


dht DHT;

int main(int argc, char **argv) 
{
 DHT.read11(INGANG);

 printf("Temperatuur = ");
 printf(DHT.temperature);
 printf("c");


}