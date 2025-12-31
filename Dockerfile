# Gunakan Java 17
FROM eclipse-temurin:17-jdk

# Install utility dos2unix untuk memperbaiki format file
RUN apt-get update && apt-get install -y dos2unix

# Set working directory
WORKDIR /app

# Copy semua file project
COPY . .

# PERBAIKAN: Paksa konversi file mvnw ke format Linux & beri izin eksekusi
RUN dos2unix mvnw && chmod +x mvnw

# Build aplikasi (Melewati tes untuk mempercepat build)
RUN ./mvnw clean package -DskipTests

# Expose port (Railway akan menggunakan port 8080 secara default)
EXPOSE 8080

# PERBAIKAN: Gunakan Shell Entrypoint agar tanda bintang (*) pada .jar terbaca
ENTRYPOINT ["sh", "-c", "java -jar target/*.jar"]