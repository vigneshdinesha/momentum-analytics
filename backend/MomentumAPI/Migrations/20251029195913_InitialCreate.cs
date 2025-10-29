using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace MomentumAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "raw_health_data",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    source = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    data_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    raw_json = table.Column<string>(type: "jsonb", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_raw_health_data", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: false),
                    first_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    last_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    subscription_tier = table.Column<string>(type: "text", nullable: false),
                    onboarding_complete = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "manual_checkins",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    sleep_hours = table.Column<decimal>(type: "numeric", nullable: true),
                    sleep_quality = table.Column<int>(type: "integer", nullable: true),
                    sleep_notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    energy_morning = table.Column<int>(type: "integer", nullable: true),
                    energy_afternoon = table.Column<int>(type: "integer", nullable: true),
                    energy_evening = table.Column<int>(type: "integer", nullable: true),
                    mood = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    stress_level = table.Column<int>(type: "integer", nullable: true),
                    exercise_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    exercise_duration = table.Column<int>(type: "integer", nullable: true),
                    exercise_intensity = table.Column<int>(type: "integer", nullable: true),
                    caffeine_mg = table.Column<int>(type: "integer", nullable: true),
                    water_glasses = table.Column<int>(type: "integer", nullable: true),
                    ate_breakfast = table.Column<bool>(type: "boolean", nullable: true),
                    screen_time_before_bed = table.Column<int>(type: "integer", nullable: true),
                    deep_work_hours = table.Column<decimal>(type: "numeric", nullable: true),
                    productivity_rating = table.Column<int>(type: "integer", nullable: true),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_manual_checkins", x => x.id);
                    table.ForeignKey(
                        name: "FK_manual_checkins_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_manual_checkins_user_id_date",
                table: "manual_checkins",
                columns: new[] { "user_id", "date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_raw_health_data_date_source",
                table: "raw_health_data",
                columns: new[] { "date", "source" });

            migrationBuilder.CreateIndex(
                name: "IX_users_email",
                table: "users",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "manual_checkins");

            migrationBuilder.DropTable(
                name: "raw_health_data");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
