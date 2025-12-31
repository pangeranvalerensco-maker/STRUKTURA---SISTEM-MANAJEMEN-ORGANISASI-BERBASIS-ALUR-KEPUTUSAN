# Gunakan Java 17
FROM eclipse-temurin:17-jdk

# Set working directory
WORKDIR /app

# Copy semua file project
COPY . .

RUN chmod +x mvnw

# Build aplikasi
RUN ./mvnw clean package -DskipTests

# Expose port Render
EXPOSE 8080

# Jalankan Spring Boot
CMD ["java", "-jar", "target/*.jar"]
