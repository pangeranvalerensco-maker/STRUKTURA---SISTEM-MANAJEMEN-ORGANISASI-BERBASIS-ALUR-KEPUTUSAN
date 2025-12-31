# Tahap 1: Build (Pembangunan aplikasi)
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Install dos2unix untuk membersihkan karakter Windows jika ada
RUN apt-get update && apt-get install -y dos2unix

# Salin semua file
COPY . .

# Pastikan mvnw dalam format Linux dan bisa dieksekusi
RUN dos2unix mvnw && chmod +x mvnw

# Jalankan build Maven (Tahap ini yang akan menghasilkan file .jar)
RUN ./mvnw clean package -DskipTests

# Tahap 2: Runtime (Hanya mengambil hasil build saja)
FROM eclipse-temurin:17-jre
WORKDIR /app

# Salin file .jar dari tahap 'build' ke tahap final ini
# Ini memperbaiki masalah wildcard (*) pada CMD sebelumnya
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

# Jalankan aplikasi secara langsung
ENTRYPOINT ["java", "-jar", "app.jar"]