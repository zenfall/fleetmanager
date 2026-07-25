# ---------- Etape 1 : build ----------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build

# Cache des dependances Maven (couche separee pour accelerer les rebuilds)
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# ---------- Etape 2 : image d'execution ----------
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN addgroup -S fleet && adduser -S fleet -G fleet
COPY --from=build /build/target/backend.jar app.jar
RUN chown fleet:fleet app.jar
USER fleet

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
