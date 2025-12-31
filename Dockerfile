# Tahap 1: Build menggunakan Java 21
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Install dos2unix untuk membersihkan format CRLF Windows
RUN apt-get update && apt-get install -y dos2unix

COPY . .

# Pastikan mvnw menggunakan format Linux dan bisa dieksekusi
RUN dos2unix mvnw && chmod +x mvnw

# Proses build ini yang akan menciptakan file .jar di dalam server
RUN ./mvnw clean package -DskipTests

# Tahap 2: Runtime
FROM eclipse-temurin:21-jre
WORKDIR /app

# Mengambil file .jar yang dihasilkan dari tahap build di atas
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]