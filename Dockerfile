# Tahap 1: Build (Pembangunan)
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Install dos2unix untuk jaga-jaga format file
RUN apt-get update && apt-get install -y dos2unix

COPY . .

# Pastikan mvnw dalam format Linux dan bisa dieksekusi
RUN dos2unix mvnw && chmod +x mvnw

# Jalankan build untuk menghasilkan file .jar di dalam container
RUN ./mvnw clean package -DskipTests

# Tahap 2: Runtime (Menjalankan aplikasi)
FROM eclipse-temurin:17-jre
WORKDIR /app

# Salin file .jar yang sudah jadi dari tahap build ke tahap runtime
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

# Jalankan aplikasi
ENTRYPOINT ["java", "-jar", "app.jar"]