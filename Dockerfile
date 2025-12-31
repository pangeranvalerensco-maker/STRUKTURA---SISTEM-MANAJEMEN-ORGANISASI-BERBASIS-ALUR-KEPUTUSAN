# Gunakan Java 17
FROM eclipse-temurin:17-jdk

# Install utility untuk memperbaiki format file (dos2unix)
RUN apt-get update && apt-get install -y dos2unix

# Set working directory
WORKDIR /app

# Copy semua file project
COPY . .

# PERBAIKAN: Ubah format Windows ke Linux & Beri Izin Eksekusi
RUN dos2unix mvnw && chmod +x mvnw

# Build aplikasi (pastikan internet stabil di Railway)
RUN ./mvnw clean package -DskipTests

# Expose port
EXPOSE 8080

# PERBAIKAN: Gunakan Shell Form agar wildcard (*) terbaca
ENTRYPOINT ["sh", "-c", "java -jar target/*.jar"]